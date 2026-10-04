---
date: "2020-11-17T00:00:00+02:00"
title: "Lutsip LS3D Editor"
draft: false
weight: 40

params:
  preview: "My own OpenGL-based level editor for Hidden & Dangerous 2, built by reverse engineering the game's undocumented file formats."
  category: "graphics"
  category_order: 2
  type: "High school capstone project"
  image:
    src: "media/projects/lutsip/lutsip3.jpg"
    scale: 0.5
  tags:
    - csharp
    - opengl
---

A custom level editor for _Hidden & Dangerous 2_, powered by my own C# OpenGL-based 3D engine, developed as part of my high school capstone project.

The project required an in-depth analysis and partial reimplementation of the original game engine, as no official modding tools or documentation were available. Over the course of a year, I reverse engineered most relevant file formats and built an editor for creating and complete editing of game levels.

While some tools already existed, they lacked a 3D view and supported only a limited subset of features, making it effectively impossible to create new levels or significantly modify existing ones. The editor significantly improves the modding workflow, allowing creators to design levels in a more intuitive and efficient way. Its release marked a new era for _Hidden & Dangerous 2_ modding.

<!--more-->

{{< carousel images="carousel-lutsip.images" duration="5000" >}}

<div class="d-flex justify-content-end">
  <a target="_blank" rel="noopener noreferrer" href="https://www.rprclan.com/forum/23-modding/3095-lutsip-ls3d-editor" class="btn btn-primary">
  View release page
  </a>
</div>

## Technical insight

Working on Lutsip provided practical experience with real-time rendering techniques used in older game engines, such as the LS3D Engine.

The project involved implementing and understanding core concepts such as:

- Scene graph
- Gouraud/Phong shading
- View frustum culling
- Sector/portal/occluder occlusion culling
- Uniform spatial grids for collision detection
- Lightmapping
- Morph target animation

Many modern rendering systems still rely on these techniques, often in evolved forms.

## Key features

{{< article-panel kind="features" title="Editing workflows" >}}
- **Scene editing**
  Models, lights, sounds, particle effects, and other objects, including collider creation or creation of animated paths for cameras and aircrafts
- **Actors and AI**
  Assigning 25+ actor types, including characters and vehicles; editing character inventories and AI navigation waypoint grids
- **Graphics effects**
  Configuring animated water, volumetric lighting, vegetation, and other special effects
{{< /article-panel >}}

## Tech stack

{{< article-panel kind="features" title="Tools and their roles" >}}
- **C#**
  Implementation language
- **OpenGL**
  Rendering
- **[OpenTK](https://opentk.net/)**
  OpenGL bindings for C#
- **Windows Forms**
  User interface with mostly custom-drawn components using GDI+
{{< /article-panel >}}
