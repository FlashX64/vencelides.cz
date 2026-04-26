---
date: "2020-11-16T00:00:00+02:00"
title: "Blender LS3D Tools"
draft: false
weight: 20

params:
  type: "Blender addon"
  image:
    src: "media/projects/ls3d-tools/ls3d-tools1.jpg"
    scale: 0.5
  tags:
    - python
    - blender
---

A Blender addon developed as a companion tool to the [Lutsip LS3D Editor]({{< relref "lutsip" >}}), enabling the _Hidden & Dangerous 2_ modding community to create custom 3D assets for the game.
<br/>
<br/>
The addon adds support for the 4DS format, allowing users to import, create, and export all supported object types. It provides full control over LS3D-specific object types and materials, including engine-specific settings.

<!--more-->
<br/>
The tool was built as one of my first Blender addons, so the internal codebase could be improved. However, it remains fully functional and is still actively used by modders to create custom levels, weapons, and other assets for the game.
<br/>
<br/>
{{< carousel images="carousel-ls3d-tools.images" show_description="true" duration="5000" >}}

<div class="d-flex justify-content-end">
  <a target="_blank" rel="noopener noreferrer" href="https://github.com/FlashX64/blender-ls3d-tools" class="btn btn-primary">
  View on GitHub
  </a>
</div>

## Showcase

{{<project-youtube id="8m82NiKpFmM" description="Video showing the tools in use, by Sasha.">}}
<br/>
{{<project-youtube id="1jzblFCxn6w" description="Video showcasing custom armory created using the tools, by Sasha.">}}
<br/>
{{<project-youtube id="vwX4wPxkrLY" description="Video showcasing custom vehicle created using the tools, by Sasha.">}}

## Limitations

- No support for skeletal meshes or morph targets (shape keys), making character creation impossible
- Missing export support for flat shading normals (all meshes are implicitly exported as smooth shaded)

## Key features

- 4DS import/export
- Engine-specific object configuration
- Standard mesh, billboard mesh creation
- Sectors, portals, occluder creation
- Lens flares creation
- Complete LS3D material settings support
- Complete LS3D object settings support

## Tech stack

- Python
- Blender Python API
