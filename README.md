# RepRapFirmware / Duet Postprocessor for Macadam

Source-only preview; not a qualified machine profile or a stable public API release.
This package registers through the ordinary Macadam `cam:postprocess` plugin API.
It exports files only; machine communication drivers are separate.

## Controller scope

Targets RepRapFirmware / Duet CNC configurations. Tool changes emit bare `Tn`;
the controller owns `tfree`, `tpre` and `tpost` macros and tool offsets.
Drilling remains explicit toolpath motion, without canned cycles.

The current profile supports millimetres, absolute XYZ, incremental XY arc
centres, XY helices, optional indexed A and G54–G59. It does not claim continuous
4/5-axis, inch output, coolant or counterclockwise spindle control.
Spindle start uses M3; stop uses M5; program end uses M2.
Unmapped tools currently produce a manual-change comment, **not a machine stop**.
Provide a valid mapping and controller macros, or arrange safe manual changes
outside this preview. A comment must never be mistaken for an interlock.

## Install and use

Requires a Macadam build implementing Postprocessor plugin registration; ordinary
released builds may not have that API yet. Download a reviewed commit, then use
Macadam's local plugin folder installer to select this directory containing
`plugin.json`, `index.js` and `post.js`. No npm install or network access is needed.
The package id is `com.macadam.posts.reprapfirmware`; the registered selection
is `com.macadam.posts.reprapfirmware/default`.
Select it in CAM G-code export, configure work offset, decimal precision, positive
feeds/RPM and library-tool-to-magazine mappings, then save/download the file.

Tool numbers crossing JavaScript must use decimal strings when larger than
9007199254740991; the host API must validate these without numeric coercion.
This transport qualification is pending and this preview must not be used to
claim large-slot support in an existing application build.

## Tests

Run `node --test test.mjs` (Node 20+; built-in modules only).
These package tests verify registration, source integrity and declared controller
instructions. They do not replace Macadam's independent 24 byte comparisons,
two literal goldens, negative/lifecycle tests, matching WASM/native builds or UI
selection/configuration/download/cancel qualification; all remain required.

## Source and license

The three plugin source files are byte-exact extractions from Macadam prototype
`610072ce641d72bbd59e2ff635c724bd250f0844`, scoped to
`rust/crates/cam/posts/reprapfirmware/`.
This repository contains newly authorized plugin code and documentation only.
MIT applies to these files; it grants no license to the private Macadam core.
