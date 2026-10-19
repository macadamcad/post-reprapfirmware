# RepRapFirmware / Duet Postprocessors for Macadam

API2 source preview, version `2.0.0-alpha.1`. Matching Rust/WASM/native builds and real UI/machine qualification remain UNRUN. This draft is not a supported stable release.

Ordinary Macadam plugins that export files; machine communication drivers are separate. Source and new public declarations/documentation are MIT-licensed; no private Macadam core license is granted.

## Controller scope

`default` / `repRapFirmware`: RepRapFirmware / Duet CNC, bare `Tn` tool changes through controller-owned `tfree`/`tpre`/`tpost` macros. Default is automatic and requires a mapping. There is no manual-change hook: selecting manual policy fails explicitly. Tool offsets/parking belong to configured controller macros. Drilling is explicit peck motion, never substituted canned cycles.

All supplied profiles output millimetres, absolute XYZ, incremental XY arcs/helices/full circles, G54–G59, M3/M4 spindle, M5 stop, M2 end. Coolant is deliberately undeclared: requests for flood/mist fail until a machine-specific profile supplies configured and qualified hooks. Indexed A is declared only where supported. Machine wiring/macros must match these instructions; physical qualification is not implied.

## Install, configure and use

Use a Macadam build implementing Postprocessor API2. Download a reviewed commit, extract it, and select this folder through **Plugins → Install Folder…**. No npm install or runtime network is needed. Select the Postprocessor in CAM G-code export; choose work offset, precision, feeds/RPM, direction/coolant and tool policy. Native uses the active magazine; web accepts tool mappings. Canonical decimal-string slots preserve integers above 2^53−1 through i64::MAX.

Automatic changes with unmapped tools fail. Manual changes use a real profile pause; the legacy unmapped-tool comment is not a stop and is unavailable as an application policy. Unsupported capabilities or unresolved operations return no downloadable partial program.

Read [API.md](API.md) and use [postprocessor-api.d.ts](postprocessor-api.d.ts) to author custom syntax. Bundled and third-party posts use the same public API and lifecycle. Macadam vendors exact commits/version/SHA-256 and generated package bytes for offline availability.

## Tests and status

Run `node --test test.mjs` (Node 20+, built-in modules only). Three package tests cover public registration, integrity and explicit controller policy. These do not replace real Rust byte/golden, custom-event/negative tests, matching builds or UI qualification. Those remain UNRUN in this source-only cloud lane.

Only newly authorized Postprocessor package source, declarations and documentation are published here. See [LICENSE](LICENSE).

Controller-scope reference: [GRBL compile-time configuration](https://github.com/gnea/grbl/blob/master/grbl/config.h) documents optional, default-disabled ENABLE_M7. RRF coolant words are not assumed from the generic RepRap G-code list; configure explicit machine-specific hooks before declaring that capability.
