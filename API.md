# Macadam Postprocessor API2

Source contract for `2.0.0-alpha.1`; matching Rust/WASM/native and actual UI qualification are still UNRUN. This is not yet a stable release or a qualified machine profile.

Use the MIT `postprocessor-api.d.ts` declarations. A package's `plugin.json` keeps local-plugin `apiVersion: "1"`, declares `cam:postprocess`, and points to an entry with `activate(host)`. Call `host.registerPostProcessor(descriptor)` for each descriptor. The descriptor has `apiVersion: "2"`; its canonical identity is `<manifest.id>/<descriptor.id>`. Both bundled and installed packages use this same registration and validator. Aliases must be unique. Display names are not identities.

## Data and lifecycle

Registration accepts bounded finite JSON data only: callbacks, accessors, sparse arrays, unknown fields, hook names and unavailable bindings fail. No plugin JavaScript runs per motion. The host prepares an ordered program from resolved CAM operations, preserving authored toolpaths and stable operation IDs; it refuses the entire export if any operation or setting is unresolved.

Event order is program start; for each operation, start, changed tool, spindle/coolant state, indexed rotation, authored motions/retracts, end; final coolant off, spindle stop and program end. Tool changes stop active spindle/coolant first. Same mapped tool changes and unchanged feed/RPM/index are suppressed. Spindle reversal requires a stop. A retract is an authored lift, not a synthesized safety move. Profiles/macros and machine setup must provide any parking, safe clearance and offset handling required by the controller.

Profiles declare fixed output units (`mm` or `inch`), `xyz` or `xyz-indexed-a`, `none` or `xy-incremental` arcs, helix/full-circle support, default tool-change policy, comment delimiters and event blocks. Unsupported axes, arcs, helices, full circles, spindle direction, coolant or tool-change policies fail with operation/move evidence. Arc start/end radii must agree within 0.000001 mm; errors include both radii, residual and limit.

## Templates

Each event contains up to 32 blocks; a block is exactly `{line: tokens}` or `{comment: tokens}`, with 1–32 tokens. Empty operation boundary arrays are allowed. Each token is a literal `{text: "..."}` or a numeric binding `{value, precision, prefix?, suffix?, optional?}`. Text is bounded single-line source supplied by the trusted author. Precision is `integer` or `coordinate` (the configured 0–9 decimals). The host uses one deterministic numeric formatter and scrubs negative zero. RPM/feed that round to nonpositive output are rejected.

Numeric positions, arc offsets, safe clearance and feeds arrive in millimetres/mm per minute. The host converts them once to the profile's output units. RPM/angles and integer identities are not length-scaled. Tool slots use signed-64-bit nonnegative integers and serialize as exact decimal strings, never through a float. JSON callers must supply canonical decimal strings above 2^53−1; unsafe large numeric JSON inputs are rejected.

| Event key | Numeric bindings | Label bindings (comment blocks only) |
|---|---|---|
| programStart | workOffset (required in executable output) | — |
| operationStart, operationEnd | operationIndex | operationName, operationId |
| toolChangeAutomatic | toolSlot (required), safeZ | toolName |
| toolChangeManual | toolSlot (optional allowed), safeZ | toolName |
| spindleCW, spindleCCW | rpm (required) | — |
| rotaryIndex | angle (required) | — |
| rapid, retractRapid | x, y, z (all required) | — |
| linear, retractFeed | x, y, z, feed (all required) | — |
| arcCW, arcCCW | x, y, z, i, j, feed (all required) | — |
| spindleStop, coolantOff, coolantFlood, coolantMist, programEnd | — | — |
| unmappedTool | — | toolName |

`feed` must be optional, because the host omits unchanged modal feed values. Its prefix/suffix disappear with it. Dynamic labels can only appear inside comments; control/line characters and closing comment delimiters are escaped. A manual-change hook, stop/coolant hook and program end must contain executable output; a comment alone is refused. A declaration of manual-change capability asserts that its controller instructions actually wait for safe user intervention; Macadam cannot prove arbitrary controller syntax. Validate it on the target machine before use.

Example of independently authored syntax (not a G-code prefix preset):

```js
linear: [{line: [
  {text: 'MOVE('},
  {value: 'x', precision: 'coordinate'},
  {value: 'y', precision: 'coordinate', prefix: ','},
  {value: 'z', precision: 'coordinate', prefix: ','},
  {text: ')'},
  {value: 'feed', precision: 'coordinate', prefix: ' RATE=', optional: true}
]}]
```

`unmappedTool` is a low-level legacy byte-compatibility hook only. Application exports cannot select legacy policy. `automatic` requires a mapped tool; `manual` invokes an explicit pause hook; `reject` refuses a required change. LinuxCNC M6/G43 and RepRapFirmware bare T are package instructions, never core ID switches.

## Host export settings and ownership

Typed `PostExportConfiguration` covers post identity, units, work offset, precision, tool-change mode, feeds/RPM, spindle direction, coolant, tool mapping and per-operation settings keyed by stable authored operation ID. Export-info metadata lists operation IDs and profile capabilities. Both clients expose common settings and check the selected descriptor is still installed/unchanged before returning a file. Cancel returns no file and does not mutate the document or installation.

The host reserves `com.macadam.posts` and its descendants plus shipped package identities. Installed code cannot self-grant ownership, replace a bundled profile, or uninstall it. Existing `com.macadam.examples.*` packages remain valid. A user-requested replacement of an ordinary local package is atomic after validation. Web mutations are serialized; persistence failures restore the prior registration; late command replies from unloaded/replaced packages are rejected. Restore isolates each bad package. This is trusted local code, not a hostile-code sandbox or verified publisher-signing system.

## Qualification boundary

Package registration/integrity and cloud Node lifecycle checks are available. Independent Rust 24-byte compatibility cases, two unchanged literal goldens, custom-syntax/event/negative Rust tests, matching native/WASM builds and actual browser/native save/download/cancel checks must pass before a supported release. No machine communication occurs during export; drivers are a separate concept.
