---
date: "2020-11-17T00:00:00+02:00"
title: "Lutsip LS3D Editor"
draft: false
weight: 40

params:
  type: "High school capstone project"
  image:
    src: "media/projects/lutsip/lutsip3.jpg"
    scale: 0.5
  tags:
    - csharp
    - opengl
---

A custom level editor for _Hidden & Dangerous 2_, powered by my own C# OpenGL-based 3D engine, developed as part of my high school capstone project.
<br/>
<br/>
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

- Full scene editing (models, lights, sounds, particle effects and other objects)
- Assigning 25+ actor types (characters, vehicles and other interactive objects)
- AI navigation waypoint grid editing
- Colliders creation
- Special graphics effects configuration (animated water, volumetric lighting, vegetation, etc.)
- Characters' inventory editing
- Animation path editing (for cameras/aircrafts)
  <br/>
  <br/>

## Tech stack

- C#
- OpenGL – real-time rendering
- [OpenTK](https://opentk.net/) – OpenGL bindings for C#
- Windows Forms – UI with mostly custom-drawn components using GDI+
