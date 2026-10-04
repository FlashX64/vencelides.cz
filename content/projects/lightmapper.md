---
date: "2025-04-14T00:00:00+02:00"
title: "Lightmap Generator"
draft: false
weight: 50

params:
  preview: "A lightmap baking tool developed for my bachelor's thesis, with CPU path tracing, progressive results and an interactive OpenGL renderer."
  category: "graphics"
  category_order: 1
  type: "Bachelor's thesis"
  image:
    src: "media/projects/lightmapper/lm-thumb.jpg"
    scale: 0.5
  tags:
    - c-cpp
    - opengl
---

A lightmap baking tool I developed as part of my Bachelor's thesis, focused on precomputed global illumination in 3D scenes. It supports interactive scene visualization, light setup, and lightmap baking, with global illumination computed using a CPU-based path tracer. Results are generated progressively and can be inspected during the bake.

The thesis goes beyond the implementation, it documents both the underlying theory and the complete lightmapping pipeline, making it a practical reference for understanding how these systems work.

<!--more-->

## Results

To demonstrate the capabilities of the tool, a test scene inspired by <a href="https://therealmjp.github.io/posts/sg-series-part-6-step-into-the-baking-lab/">_The Baking Lab_</a> (Neubelt, Pettineo) was used, as it provides a controlled setup for evaluating different lightmapping approaches.

The scene is designed to highlight different lighting effects and the strengths of individual lightmap representations.

{{< article-panel kind="features" title="Scene features" >}}
- **Indirect lighting**
  Light bouncing off differently colored walls
- **Shadowing**
  Small objects occluding the light
- **Light transmission**
  Texture alpha controls how much light passes through a surface
- **Normal mapping**
  Directional lightmaps allow baked diffuse lighting to be evaluated at runtime using normals from a normal map
{{< /article-panel >}}

{{< article-panel kind="facts" title="Test configuration" >}}
The lighting setup consists of a spot light above the scene and a point light inside it.

- **64**
  samples per texel
- **Up to 4**
  light bounces
- **Bicubic**
  texture filtering
{{< /article-panel >}}

{{< carousel images="carousel-lightmapper-results.images" show_description="true" duration="5000" >}}

## Core Approach

Global illumination is computed using a custom CPU-based path tracer, progressively accumulating samples for each lightmap texel. The integration is based on quasi-Monte Carlo methods, using low-discrepancy sequences to improve convergence compared to purely random sampling. A denoising step is applied during postprocessing to reduce Monte Carlo noise.

The implementation is limited to diffuse global illumination, assuming a Lambertian BRDF and using cosine-weighted hemisphere sampling for indirect bounces. Scenes can be lit using analytical (infinitesimal, zero-area) light sources – directional, point, and spot lights. It also supports transparency, allowing rays to pass through partially transmissive surfaces.

Computed lighting is stored in HDR lightmaps, with optional directional encoding using 3rd-order spherical harmonics to support normal mapping.

The tool uses a custom, lightweight OpenGL-based engine for visualization, with an _ImGui_-based UI for interaction. In addition to lit scene rendering, it provides debug views for lightmap charts and texel density directly on surfaces.

{{< carousel images="carousel-lightmapper-tool.images" show_description="true" duration="5000" >}}

<div class="d-flex justify-content-end">
  <a target="_blank" rel="noopener noreferrer" href="https://is.vspj.cz/bp/get-bp/student/74888/thema/11163" class="btn btn-primary">
  View full thesis (Czech only)
  </a>
</div>
<br/>

{{< article-panel kind="steps" title="Baking stages" >}}
1. **[Preprocessing](#preprocessing)**
   Map texels to geometry and prepare sampling points and the dilation map.
2. **[Lighting computation](#lighting-computation)**
   Trace light paths on the CPU, accumulating results progressively.
3. **[Postprocessing](#postprocessing)**
   Fill padding texels on the GPU, then denoise the lightmaps.
{{< /article-panel >}}

### Lightmap atlas & UV parametrization

The lightmap atlas is generated using _xatlas_, which segments geometry into charts – typically contiguous surface regions with similar face normals – and packs them into a non-overlapping UV layout.

To support both bilinear and bicubic filtering, the atlas includes a three-texel padding (gutter), preventing light leaking between neighboring charts during texture sampling.

### Acceleration structures

The tool uses two complementary acceleration structures:

- A BVH (_Intel Embree_) built from the scene snapshot, used to accelerate ray intersection queries during path tracing.
- A uniform 3D grid for light culling, where each cell stores the lights affecting its volume. Since lights are modeled with bounded influence (finite falloff), this allows efficient evaluation of only relevant light sources during path tracing.

### Preprocessing

Preprocessing establishes the mapping between lightmap texels and surface geometry and generates sampling points for lighting evaluation. Instead of sampling only at texel centers, each texel is populated with 64 samples using a _Hammersley low-discrepancy sequence_.

A so-called _dilation map_ is also generated to handle padding texels. For texels within a two-texel radius of chart boundaries, the tool precomputes mappings between fill targets and valid source texels.

### Lighting computation

Global illumination is computed using a CPU-based path tracer with multi-threaded execution, where each thread processes a subset of texels. The computation is progressive, allowing intermediate results to be visualized during baking.

Primary rays are sampled using a _Halton low-discrepancy sequence_ over the hemisphere. Secondary bounces use _cosine-weighted sampling_, assuming a Lambertian BRDF.
The system supports transparency, allowing rays to pass through partially transmissive surfaces.

### Postprocessing

Firstly, texel dilation is performed on the GPU via a compute shader, using the precomputed dilation map.
Secondly, as Monte Carlo integration naturally produces noisy results, a denoising step is applied using _Intel Open Image Denoise (OIDN)_, running on either CPU or GPU depending on hardware availability.

### Lightmap representation

The system supports two lightmap formats.

{{< article-panel kind="comparison" title="Two output formats" >}}
- **Directional lightmaps**
  3rd-order spherical harmonics: 9 coefficients per texel, stored in 9 textures. Lighting can be reconstructed from surface normals, supporting normal mapping.
- **Non-directional lightmaps**
  Irradiance stored per texel in a single texture.
{{< /article-panel >}}

Lightmap coefficients are stored in HDR using _RGBM encoding_ (range ⟨0, 5⟩ in gamma space), allowing them to be saved in standard PNG format while preserving dynamic range.

### Limitations

While the tool is capable of producing visually convincing results, achieving high-quality output often requires iterative tuning of parameters. As a result, effective use of the tool assumes a basic understanding of lightmapping principles and their impact on the final solution.

{{< article-panel kind="note" title="Known limitation: chart seams" >}}
The most significant limitation is the absence of a dedicated solution for **smoothing lighting discontinuities at chart seams**. Since adjacent charts are computed independently, visible seams can appear due to differences in computed lighting coefficients. This artifact is most noticeable at lower lightmap resolutions and becomes less pronounced as resolution increases, but without explicit seam correction, it cannot be fully eliminated.
{{< /article-panel >}}

{{<project-picture
  src="media/projects/lightmapper/lm-artifacts.jpg"
  description="**Artifact**: Lighting discontinuities at chart seams. Left: chart segmentation (color-coded). Right: generated lightmap. Discontinuities appear along chart boundaries."
>}}
<br/>

### Tech stack

{{< article-panel kind="features" title="Tools and their roles" >}}
- **C++20**
  Implementation language
- **OpenGL 4.6**
  Rendering and GPU-based computation
- **[xatlas](https://github.com/jpcy/xatlas)**
  Lightmap atlas generation and UV parametrization
- **[Intel Embree](https://www.embree.org/)**
  BVH construction and ray intersection acceleration
- **[Intel Open Image Denoise (OIDN)](https://www.openimagedenoise.org/)**
  Denoising of path-traced lightmaps
- **[ImGui](https://github.com/ocornut/imgui)**
  User interface
{{< /article-panel >}}
