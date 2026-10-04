---
date: "2021-11-09T00:00:00+02:00"
title: "Blender Ptero Tools"
draft: false
weight: 30

params:
  preview: "A Blender addon for Vietcong and Vietcong 2 assets, supporting models, materials, skeletal animation and engine-specific settings."
  category: "graphics"
  category_order: 3
  type: "Blender addon"
  image:
    src: "media/projects/ptero-tools/ptero-tools1.jpg"
    scale: 0.5
  tags:
    - python
    - blender
---

A Blender addon adding full support for _Vietcong_ / _Vietcong 2_ (Ptero-Engine-II / Ptero-Engine-III) 3D formats which enables creation of custom 3D assets for both games.

While official tools existed, they were limited to outdated versions of 3ds Max (7/8) and lacked support for advanced workflows such as character creation, skeletal animation, and vehicle assets. In addition, the dependency on licensed software and plugins incompatible with modern versions made them impractical to use.

To overcome these limitations, I developed a complete Blender-based toolchain, enabling modern and more efficient asset workflows. The project involved extensive reverse engineering of proprietary file formats.

The addon supports complete import/export of engine formats, including skeletal meshes, animations, facial expressions, and equipment placement, while also exposing engine-specific configuration and material settings.

<!--more-->
{{< carousel images="carousel-ptero-tools.images" show_description="true" duration="5000" >}}

Even before full animation support was implemented, I used an early version of the addon to create [Koppa]({{< relref "koppa.md" >}}) (2020), likely the first map created entirely in Blender for _Vietcong_.

{{< article-panel kind="note" title="Availability" >}}
The tools were developed for personal use and were never publicly released.
{{< /article-panel >}}

## Key features

{{< article-panel kind="features" title="Asset workflows" >}}
- **Objects and properties**
  Engine-specific object configuration and asset properties
- **Characters and animation**
  Support for skeletons, skeletal animation, and shape keys
- **Materials**
  Full support for Ptero-Engine-II/III materials
{{< /article-panel >}}

### Supported formats

{{< article-panel kind="table" title="Import and export" >}}
| Format | Asset type |
| :--- | :--- |
| **BES** | 3D models |
| **STG** | Skeletal animation |
| **MANM** | Model animation |
| **EQP** | Equipment placement |
| **XDT** | Facial expression sets |
{{< /article-panel >}}

## Showcase
{{< carousel images="carousel-ptero-tools-show.images" show_description="true" duration="5000" >}}
{{<project-video volume_controls=false src="media/projects/ptero-tools/char-anim" description="A character walk animation imported into Blender" >}}
{{<project-video volume_controls=false src="media/projects/ptero-tools/weapon-anim" description="A first-person hand animation imported into Blender (slowed down)">}}

## Tech stack

{{< article-panel kind="features" title="Technologies" >}}
- **Python**
- **Blender Python API**
- **NumPy**
{{< /article-panel >}}
