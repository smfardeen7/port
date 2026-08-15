import * as THREE from 'three/webgpu'

const text = `
███████╗ █████╗ ██████╗ ██████╗ ███████╗███████╗███╗   ██╗
██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝████╗  ██║
█████╗  ███████║██████╔╝██║  ██║█████╗  █████╗  ██╔██╗ ██║
██╔══╝  ██╔══██║██╔══██╗██║  ██║██╔══╝  ██╔══╝  ██║╚██╗██║
██║     ██║  ██║██║  ██║██████╔╝███████╗███████╗██║ ╚████║
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═══╝

██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗ 
██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ 

╔═ Intro ═══════════════╗
║ Thank you for visiting my portfolio, you sneaky developer!
║ Mohammad Fardeen Shaik — AI Engineer. MS CS @ George Mason University.
╚═══════════════════════╝

╔═ Socials ═══════════════╗
║ Mail           ⇒ shaikfardeen595@gmail.com
║ GitHub         ⇒ https://github.com/smfardeen7
║ LinkedIn       ⇒ https://www.linkedin.com/in/shaikmofardeen/
║ Portfolio      ⇒ https://fardeen.bio/
╚═══════════════════════╝

╔═ Debug ═══════════════╗
║ You can access the debug mode by adding #debug at the end of the URL and reloading.
║ Press [V] to toggle the free camera.
╚═══════════════════════╝

╔═ Three.js ════════════╗
║ Three.js is the library I’m using to render this 3D world (release: ${THREE.REVISION})
║ https://threejs.org/
║ It was created by mr.doob (https://x.com/mrdoob, https://github.com/mrdoob),
║ followed by hundreds of awesome developers,
║ one of which being Sunag (https://x.com/sea3dformat, https://github.com/sunag) who added TSL,
║ enabling the use of both WebGL and WebGPU, making this portfolio possible.
╚═══════════════════════╝

╔═ Source ══════════════╗
║ World based on Bruno Simon’s folio-2025 (MIT). Personalized for Fardeen.
║ https://github.com/smfardeen7/port
╚═══════════════════════╝

╔═ Musics ══════════════╗
║ The music was made for the original folio by Kounine (Linktree).
║ https://linktr.ee/Kounine
║ They are under CC0 license.
║ https://github.com/brunosimon/folio-2025/tree/main/static/sounds/musics
╚═══════════════════════╝

╔═ Some more links ═════╗
║ Rapier (Physics library)  ⇒ https://rapier.rs/
║ Howler.js (Audio library) ⇒ https://howlerjs.com/
║ Amatic SC (Fonts)         ⇒ https://fonts.google.com/specimen/Amatic+SC
║ Nunito (Fonts).           ⇒ https://fonts.google.com/specimen/Nunito?query=Nunito
╚═══════════════════════╝
`
let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]

    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'

        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]
