---
date: "2021-11-09T00:00:00+02:00"
title: "Blender Ptero Tools"
draft: false
weight: 30

params:
  type: "Blender addon"
  image:
    src: "media/projects/ptero-tools/ptero-tools1.jpg"
    scale: 0.5
  tags:
    - python
    - blender
---

A Blender addon adding full support for _Vietcong_ / _Vietcong 2_ (Ptero-Engine-II / Ptero-Engine-III) 3D formats which enables creation of custom 3D assets for both games.
<br/>
<br/>
While official tools existed, they were limited to outdated versions of 3ds Max (7/8) and lacked support for advanced workflows such as character creation, skeletal animation, and vehicle assets. In addition, the dependency on licensed software and plugins incompatible with modern versions made them impractical to use.
<br/>
<br/>
To overcome these limitations, I developed a complete Blender-based toolchain, enabling modern and more efficient asset workflows. The project involved extensive reverse engineering of proprietary file formats.
<br/>
<br/>
The addon supports complete import/export of engine formats, including skeletal meshes, animations, facial expressions, and equipment placement, while also exposing engine-specific configuration and material settings.

<!--more-->
{{< carousel images="carousel-ptero-tools.images" show_description="true" duration="5000" >}}
<!-- Keep this space -->

<!-- Otherwise the link below won't render properly -->
Even before full animation support was implemented, I used an early version of the addon to create [Koppa]({{< relref "koppa.md" >}}) (2020), likely the first map created entirely in Blender for _Vietcong_.
<br/>
<br/>
The tools were developed for personal use and were never publicly released.

## Key features

- Engine-specific object configuration and asset properties
- Support for skeletons, skeletal animation, and shape keys
- Full support for Ptero-Engine-II/III materials
- BES (3D model) import/export
- STG (skeletal animation) import/export
- MANM (model animation) import/export
- EQP (equipment placement) import/export
- XDT (facial expression sets) import/export

## Showcase
{{< carousel images="carousel-ptero-tools-show.images" show_description="true" duration="5000" >}}
{{<project-video src="media/projects/ptero-tools/char-anim.mp4" description="A character walk animation imported into Blender" >}}
{{<project-video src="media/projects/ptero-tools/weapon-anim.mp4" description="A first-person hand animation imported into Blender (slowed down)">}}

## Tech stack

- Python
- Blender Python API
- NumPy
