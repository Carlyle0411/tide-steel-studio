# Asset Storage

Runtime generated assets are stored by the browser in the Movie Control Center asset database with logical local paths under this tree.

When a backend file writer is connected, generated PNG files should be materialized here:

- `characters/<asset-slug>/v001.png`
- `mechas/<asset-slug>/v001.png`
- `creatures/<asset-slug>/v001.png`
- `environment/<asset-slug>/v001.png`
- `props/<asset-slug>/v001.png`

No fake image files should be created here.
