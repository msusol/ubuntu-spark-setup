import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const POLL_SECONDS = 2;
const BAR_WIDTH = 88;   // px, represents 0-100%
const BAR_HEIGHT = 8;   // px
const WARN_AT = 70;     // % -> yellow
const CRIT_AT = 90;     // % -> red
const MEM_MAX_GB = 128; // memory bar scale: 0-128 GB

const QUERY = [
    'nvidia-smi',
    '--query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw',
    '--format=csv,noheader,nounits',
];

function num(s) {
    const v = parseFloat(s);
    return Number.isFinite(v) ? v : null;
}

// The GB10 shares memory with the CPU, so nvidia-smi often reports [N/A]
// for memory. Fall back to system memory in that case.
function systemMemory() {
    try {
        const [, bytes] = GLib.file_get_contents('/proc/meminfo');
        const text = new TextDecoder().decode(bytes);
        const total = parseInt(text.match(/MemTotal:\s+(\d+)/)[1]) / 1048576;
        const avail = parseInt(text.match(/MemAvailable:\s+(\d+)/)[1]) / 1048576;
        return {used: total - avail, total};
    } catch (e) {
        return null;
    }
}

// One labeled 0-100% bar: [NAME] [=====-----] [37%]
function makeMeter(name) {
    const box = new St.BoxLayout({
        y_align: Clutter.ActorAlign.CENTER,
        style_class: 'gpu-meter-group',
    });

    const title = new St.Label({
        text: name,
        y_align: Clutter.ActorAlign.CENTER,
        style_class: 'gpu-meter-title',
    });

    const track = new St.Widget({
        style_class: 'gpu-bar',
        y_align: Clutter.ActorAlign.CENTER,
        width: BAR_WIDTH,
        height: BAR_HEIGHT,
    });
    const fill = new St.Widget({
        style_class: 'gpu-bar-fill',
        width: 0,
        height: BAR_HEIGHT,
    });
    track.add_child(fill);

    const pct = new St.Label({
        text: '--%',
        y_align: Clutter.ActorAlign.CENTER,
        style_class: 'gpu-meter-pct',
    });

    box.add_child(title);
    box.add_child(track);
    box.add_child(pct);
    return {box, fill, pct};
}

function setMeter(meter, percent, text = null) {
    if (percent === null || !Number.isFinite(percent)) {
        meter.fill.set_width(0);
        meter.pct.text = '--';
        return;
    }
    const p = Math.max(0, Math.min(100, percent));
    meter.fill.set_width(Math.round(BAR_WIDTH * p / 100));
    meter.pct.text = text ?? `${Math.round(p)}%`;
    const level = p >= CRIT_AT ? ' crit' : p >= WARN_AT ? ' warn' : '';
    meter.fill.style_class = `gpu-bar-fill${level}`;
}

const GpuIndicator = GObject.registerClass(
class GpuIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'GPU Meter');

        const row = new St.BoxLayout({y_align: Clutter.ActorAlign.CENTER});
        this._gpu = makeMeter('GPU');
        this._mem = makeMeter('MEM');
        row.add_child(this._gpu.box);
        row.add_child(this._mem.box);
        this.add_child(row);

        this._items = {};
        for (const key of ['name', 'util', 'mem', 'temp', 'power']) {
            const item = new PopupMenu.PopupMenuItem('', {reactive: false});
            this.menu.addMenuItem(item);
            this._items[key] = item;
        }
        this._items.name.label.text = 'NVIDIA GPU';

        this._busy = false;
        this._timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT, POLL_SECONDS, () => {
                this._poll();
                return GLib.SOURCE_CONTINUE;
            });
        this._poll();
    }

    _poll() {
        if (this._busy)
            return;
        this._busy = true;
        try {
            this._proc = new Gio.Subprocess({
                argv: QUERY,
                flags: Gio.SubprocessFlags.STDOUT_PIPE |
                       Gio.SubprocessFlags.STDERR_SILENCE,
            });
            this._proc.init(null);
            this._proc.communicate_utf8_async(null, null, (proc, res) => {
                this._busy = false;
                try {
                    const [, out] = proc.communicate_utf8_finish(res);
                    this._update(out);
                } catch (e) {
                    this._showError();
                }
            });
        } catch (e) {
            this._busy = false;
            this._showError();
        }
    }

    _update(out) {
        const line = (out ?? '').trim().split('\n')[0];
        if (!line) {
            this._showError();
            return;
        }
        const [name, util, memUsed, memTotal, temp, power] =
            line.split(',').map(s => s.trim());

        // System (unified) memory on a 0-128 GB scale.
        const sys = systemMemory();
        const used = sys ? sys.used : null;

        const u = num(util);
        const memPct = used !== null ? (used / MEM_MAX_GB) * 100 : null;

        setMeter(this._gpu, u);
        setMeter(this._mem, memPct, used !== null ? `${Math.round(used)}G` : null);

        this._items.name.label.text = name || 'NVIDIA GPU';
        this._items.util.label.text = `Utilization: ${u !== null ? u + '%' : 'n/a'}`;
        this._items.mem.label.text = used !== null
            ? `System memory: ${used.toFixed(1)} / ${MEM_MAX_GB} GB`
            : 'System memory: n/a';
        this._items.temp.label.text =
            `Temperature: ${num(temp) !== null ? temp + ' °C' : 'n/a'}`;
        this._items.power.label.text =
            `Power: ${num(power) !== null ? Math.round(num(power)) + ' W' : 'n/a'}`;
    }

    _showError() {
        setMeter(this._gpu, null);
        setMeter(this._mem, null);
    }

    destroy() {
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
        super.destroy();
    }
});

export default class GpuMeterExtension extends Extension {
    enable() {
        this._indicator = new GpuIndicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator, 0, 'right');
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }
}
