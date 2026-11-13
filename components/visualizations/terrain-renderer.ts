import {LinearFilter, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, SRGBColorSpace, TextureLoader, WebGLRenderer} from 'three';

/** Animate the supplied artwork itself, rather than approximating it with geometry. */
export function mountTerrain(host: HTMLDivElement) {
  const hero = host.closest<HTMLElement>('.home-hero');
  if (!hero) throw new Error('Missing Hero');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 700px)');
  const english = document.documentElement.lang.startsWith('en');
  const renderer = new WebGLRenderer({alpha: true, antialias: false, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, small.matches ? 1 : 1.5));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.append(renderer.domElement);
  const scene = new Scene(), camera = new OrthographicCamera(-1, 1, 1, -1, 0, 2);
  camera.position.z = 1;
  const texture = new TextureLoader().load('/images/hero-reference.png', () => {loaded = true; resize(); sync();}, undefined, () => fallback());
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = false; texture.minFilter = LinearFilter;
  const uniforms = {uImage: {value: texture}, uTime: {value: 0}, uMotion: {value: reduced.matches ? 0 : 1}, uReplaceText: {value: english || small.matches ? 1 : 0}, uMobile: {value: small.matches ? 1 : 0}};
  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({uniforms,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader: `
      uniform sampler2D uImage;uniform float uTime,uMotion,uReplaceText,uMobile;varying vec2 vUv;
      vec4 artwork(vec2 uv){return texture2D(uImage,vec2(.012+uv.x*.976,.025+uv.y*.950));}
      void main(){
        vec2 uv=vUv;
        if(uMobile>.5) uv.y=(vUv.y-.06)/.65;
        // Source typography and the coordinate axis never move.
        float field=smoothstep(.14,.23,uv.y)*(1.-smoothstep(.72,.79,uv.y));
        field*=1.-(1.-smoothstep(.39,.48,uv.x))*smoothstep(.57,.65,uv.y);
        vec2 displaced=uv;
        displaced.y+=uMotion*.0024*field*sin(uv.x*8.-uTime*.43)*sin(uTime*.31);
        displaced.x+=uMotion*.0012*field*sin(uv.y*7.+uTime*.27)*sin(uTime*.23);
        vec3 color=artwork(displaced).rgb;
        // Broad, low-amplitude illumination follows existing luminous material.
        float light=sin(uv.x*5.5+uv.y*3.-uTime*.55)*sin(uTime*.28);
        color*=1.+uMotion*.12*field*light;
        // Local signal emphasis stays on the three paths already in the image.
        float signal=exp(-pow((uv.y-(.34-.035*sin(uv.x*9.)))/.025,2.));
        float head=fract(uTime*.055+.30);
        float pulse=exp(-pow((uv.x-head)/.035,2.))*signal;
        color+=uMotion*color*vec3(.16,.21,.08)*pulse;
        // English/mobile use accessible live text; replace only baked Chinese text.
        float textMask=(1.-smoothstep(.385,.425,uv.x))*smoothstep(.595,.625,uv.y)*(1.-smoothstep(.925,.965,uv.y));
        vec3 background=artwork(vec2(.025,uv.y)).rgb;
        color=mix(color,background,textMask*uReplaceText);
        float mobileShade=max(smoothstep(.57,.64,vUv.y),1.-smoothstep(0.,.05,uv.y))*uMobile;
        color=mix(color,vec3(.003,.006,.004),mobileShade);
        gl_FragColor=vec4(color,1.);
        #include <colorspace_fragment>
      }`,
  });
  scene.add(new Mesh(geometry, material));
  let alive = true, loaded = false, visible = false, failed = false, raf = 0, last = 0, time = 0, frames = 0;
  const fallback = () => {failed = true; cancelAnimationFrame(raf); host.dataset.terrainState = 'fallback'; host.dataset.motion = 'static';};
  renderer.debug.onShaderError = fallback;
  const draw = () => {
    if (!alive || !loaded || failed) return;
    try {renderer.render(scene, camera); if (!failed) {host.dataset.terrainState = 'ready'; host.dataset.frames = String(++frames); host.dataset.time = time.toFixed(3);}}
    catch {fallback();}
  };
  const resize = () => {
    if (!alive || failed) return;
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    uniforms.uReplaceText.value = english || small.matches ? 1 : 0;
    uniforms.uMobile.value = small.matches ? 1 : 0;
    draw();
  };
  const tick = (now: number) => {
    if (!alive || failed) return;
    raf = requestAnimationFrame(tick);
    if (last && now - last < (small.matches ? 32 : 16)) return;
    time += last ? Math.min(now - last, 100) / 1000 : 0; last = now;
    uniforms.uTime.value = time; draw();
  };
  const sync = () => {
    cancelAnimationFrame(raf); last = 0;
    if (!alive || !loaded || failed) return;
    uniforms.uMotion.value = reduced.matches ? 0 : 1;
    if (reduced.matches) {uniforms.uTime.value = 0; host.dataset.motion = 'static'; draw();}
    else if (visible && !document.hidden) {host.dataset.motion = 'running'; raf = requestAnimationFrame(tick);}
    else host.dataset.motion = 'paused';
  };
  const lost = (e: Event) => {e.preventDefault(); fallback();};
  const observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; sync();});
  const sizing = new ResizeObserver(resize);
  observer.observe(hero); sizing.observe(host);
  document.addEventListener('visibilitychange', sync); reduced.addEventListener('change', sync); small.addEventListener('change', resize);
  renderer.domElement.addEventListener('webglcontextlost', lost);
  return () => {
    alive = false; cancelAnimationFrame(raf); observer.disconnect(); sizing.disconnect();
    document.removeEventListener('visibilitychange', sync); reduced.removeEventListener('change', sync); small.removeEventListener('change', resize);
    renderer.domElement.removeEventListener('webglcontextlost', lost);
    geometry.dispose(); material.dispose(); texture.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
  };
}
