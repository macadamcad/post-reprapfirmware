module.exports = {
  "aliases": [
    "repRapFirmware"
  ],
  "apiVersion": "1",
  "extension": "nc",
  "id": "default",
  "mime": "text/plain",
  "name": "RepRapFirmware / Duet",
  "profile": {
    "arcs": "xy-incremental",
    "axes": "xyz-indexed-a",
    "comment": "semicolon",
    "headerLabel": "repRapFirmware",
    "motion": {
      "ccwArc": "G3",
      "cwArc": "G2",
      "linear": "G1",
      "rapid": "G0"
    },
    "programEnd": [
      [
        {
          "text": "M2"
        }
      ]
    ],
    "programStart": [
      [
        {
          "text": "G21"
        }
      ],
      [
        {
          "text": "G90"
        }
      ],
      [
        {
          "text": "G17"
        }
      ],
      [
        {
          "text": "G"
        },
        {
          "precision": "integer",
          "value": "workOffset"
        }
      ]
    ],
    "requireMappedTool": false,
    "rotaryIndex": [
      [
        {
          "text": "G0 A"
        },
        {
          "precision": "coordinate",
          "value": "rotaryAngle"
        }
      ]
    ],
    "spindleStart": [
      [
        {
          "text": "M3 S"
        },
        {
          "precision": "integer",
          "value": "rpm"
        }
      ]
    ],
    "spindleStop": [
      [
        {
          "text": "M5"
        }
      ]
    ],
    "toolChange": [
      [
        {
          "text": "T"
        },
        {
          "precision": "integer",
          "value": "toolSlot"
        }
      ]
    ],
    "units": "mm"
  }
};
