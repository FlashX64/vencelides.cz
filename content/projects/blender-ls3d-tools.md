---
date: "2020-11-16T00:00:00+02:00"
title: "Blender LS3D Tools"
draft: false
weight: 20

params:
  preview: "Blender tools for the 4DS format, enabling custom assets and materials for Hidden & Dangerous 2."
  category: "graphics"
  category_order: 4
  type: "Blender addon"
  image:
    src: "media/projects/ls3d-tools/ls3d-tools1.jpg"
    scale: 0.5
  tags:
    - python
    - blender
---

A Blender addon developed as a companion tool to the [Lutsip LS3D Editor]({{< relref "lutsip" >}}), enabling the _Hidden & Dangerous 2_ modding community to create custom 3D assets for the game.

The addon adds support for the 4DS format, allowing users to import, create, and export all supported object types. It provides full control over LS3D-specific object types and materials, including engine-specific settings.

<!--more-->

The tool was built as one of my first Blender addons, so the internal codebase could be improved. However, it remains fully functional and is still actively used by modders to create custom levels, weapons, and other assets for the game.

{{< carousel images="carousel-ls3d-tools.images" show_description="true" duration="5000" >}}

<div class="d-flex justify-content-end">
  <a target="_blank" rel="noopener noreferrer" href="https://github.com/FlashX64/blender-ls3d-tools" class="btn btn-primary">
  View on GitHub
  </a>
</div>

## Showcase

{{<project-youtube id="8m82NiKpFmM" description="Video showing the tools in use, by Sasha.">}}

{{<project-youtube id="1jzblFCxn6w" description="Video showcasing custom armory created using the tools, by Sasha.">}}

{{<project-youtube id="vwX4wPxkrLY" description="Video showcasing custom vehicle created using the tools, by Sasha.">}}

## Limitations

{{< article-panel kind="note" title="Unsupported features" >}}
- **Character creation**
  Skeletal meshes and morph targets (shape keys) are not supported, making character creation impossible.
- **Flat shading export**
  All meshes are implicitly exported as smooth shaded; flat shading normals are not supported on export.
{{< /article-panel >}}

## Key features

{{< article-panel kind="features" title="Asset workflows" >}}
- **Import and export**
  4DS import/export with engine-specific object configuration
- **Geometry**
  Creation of standard & billboard meshes
- **Engine-specific objects**
  Creation of sectors, portals, occluders, and lens flares
- **Engine-specific settings**
  Complete support for LS3D material and object settings
{{< /article-panel >}}

## Tech stack

{{< article-panel kind="features" title="Technologies" >}}
- **Python**
- **Blender Python API**
{{< /article-panel >}}
