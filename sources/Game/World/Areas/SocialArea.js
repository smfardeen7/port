import * as THREE from 'three/webgpu'
import { Fn, texture as textureNode, uv, vec4 } from 'three/tsl'
import { Game } from '../../Game.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import socialData from '../../../data/social.js'
import { Area } from './Area.js'
import { View } from '../../View.js'

export class SocialArea extends Area
{
    constructor(model)
    {
        super(model)

        this.center = this.references.items.get('center')[0].position

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '👨‍🦲 Social',
                expanded: false,
            })
        }

        this.setLinks()
        this.trimUnusedPlinths()
        this.setResumeStatue()
        this.setStatue()
        // this.setFWA()
        this.setAchievement()
    }

    setLinks()
    {
        for(const link of socialData)
        {
            let position

            if(link.position)
            {
                position = new THREE.Vector3(link.position.x, 0, link.position.z)
            }
            else
            {
                const statue = this.objects.items.find(
                    object => object.visual?.object3D?.name === link.statue
                )?.visual.object3D

                position = (statue ? statue.position : this.center).clone()
            }

            position.y = 1

            this.interactivePoint = this.game.interactivePoints.create(
                position,
                link.name,
                link.align === 'left' ? InteractivePoints.ALIGN_LEFT : InteractivePoints.ALIGN_RIGHT,
                InteractivePoints.STATE_CONCEALED,
                () =>
                {
                    if(link.url)
                        window.open(link.url, '_blank')
                    else(link.modal)
                        this.game.modals.open(link.modal)
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.addItems(['interact'])
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.removeItems(['interact'])
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.removeItems(['interact'])
                }
            )
        }
    }

    trimUnusedPlinths()
    {
        // The square plinths under every icon are baked into one shared mesh (no per-icon
        // node to hide), so the leftover ones from removed icons have to be cut out of its
        // geometry directly. The plinth at (18.14, -18.14) is kept for the Resume link.
        const mesh = this.objects.items.find(
            object => object.visual?.object3D?.name === 'Cube133'
        )?.visual.object3D

        if(!mesh || !mesh.geometry.index)
            return

        const zones = [
            { x: 24.21, z: -25.81 }, // Twitch
            { x: 33.82, z: -18.11 }, // X / Twitter
            { x: 30.87, z: -24.21 }, // YouTube
            { x: 33.05, z: -21.34 }, // Bluesky
            { x: 39.57, z: -33.21 }, // OnlyFans
        ]
        const radius = 1.6

        mesh.updateWorldMatrix(true, false)

        const geometry = mesh.geometry
        const position = geometry.attributes.position
        const sourceIndex = geometry.index.array
        const kept = []
        const vertex = new THREE.Vector3()

        for(let i = 0; i < sourceIndex.length; i += 3)
        {
            const a = sourceIndex[i], b = sourceIndex[i + 1], c = sourceIndex[i + 2]
            let cx = 0, cz = 0

            for(const vertexIndex of [ a, b, c ])
            {
                vertex.fromBufferAttribute(position, vertexIndex)
                vertex.applyMatrix4(mesh.matrixWorld)
                cx += vertex.x / 3
                cz += vertex.z / 3
            }

            const inRemovedZone = zones.some(zone => Math.hypot(cx - zone.x, cz - zone.z) < radius)
            if(!inRemovedZone)
                kept.push(a, b, c)
        }

        geometry.setIndex(kept)
        geometry.computeBoundingBox()
        geometry.computeBoundingSphere()
    }

    setResumeStatue()
    {
        // There's no pre-modelled icon for "Resume", so build a small plaque-on-a-post
        // statue matching the style of the other social icons, on the plinth kept free
        // in trimUnusedPlinths(). Anchored at the same world position (and ground height)
        // the removed Discord icon used to occupy, so it sits correctly on its plinth.
        const link = socialData.find(item => item.name === 'Resume')

        if(!link?.position)
            return

        const base = new THREE.Vector3(link.position.x, 1.56, link.position.z)

        // Support post
        const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.045, 0.5, 8),
            new THREE.MeshStandardNodeMaterial({ color: '#2c2740', roughness: 0.6, metalness: 0.2 })
        )
        post.position.copy(base)
        post.position.y += 0.25
        post.castShadow = true
        post.receiveShadow = true
        this.game.scene.add(post)

        // Plaque face: a document icon (folded corner + text lines) drawn on a canvas,
        // using the same alpha-cutout shading as the landing sign.
        const size = 256
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const context = canvas.getContext('2d')
        context.fillStyle = '#000000'
        context.fillRect(0, 0, size, size)
        context.strokeStyle = '#ffffff'
        context.lineWidth = 10
        context.lineJoin = 'round'
        context.lineCap = 'round'

        const margin = 44
        const fold = 46
        context.beginPath()
        context.moveTo(margin, margin)
        context.lineTo(size - margin - fold, margin)
        context.lineTo(size - margin, margin + fold)
        context.lineTo(size - margin, size - margin)
        context.lineTo(margin, size - margin)
        context.closePath()
        context.stroke()

        context.beginPath()
        context.moveTo(size - margin - fold, margin)
        context.lineTo(size - margin - fold, margin + fold)
        context.lineTo(size - margin, margin + fold)
        context.stroke()

        context.lineWidth = 9
        const lineStart = margin + 26
        const lineEnd = size - margin - 26
        for(const y of [ 112, 144, 176 ])
        {
            context.beginPath()
            context.moveTo(lineStart, y)
            context.lineTo(lineEnd, y)
            context.stroke()
        }
        context.beginPath()
        context.moveTo(lineStart, 208)
        context.lineTo(lineEnd - 40, 208)
        context.stroke()

        const iconTexture = new THREE.Texture(canvas)
        iconTexture.needsUpdate = true
        iconTexture.colorSpace = THREE.SRGBColorSpace
        iconTexture.minFilter = THREE.LinearFilter
        iconTexture.generateMipmaps = false

        const plaqueMaterial = new THREE.MeshBasicNodeMaterial({ transparent: true })
        plaqueMaterial.outputNode = Fn(() =>
        {
            textureNode(iconTexture, uv()).r.lessThan(0.5).discard()
            return vec4(1.8)
        })()

        const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.65), plaqueMaterial)
        plaque.position.copy(base)
        plaque.position.y += 0.85
        plaque.rotation.x = -0.35
        plaque.rotation.y = 0.5
        plaque.renderOrder = 2
        plaque.castShadow = false
        plaque.receiveShadow = false
        this.game.scene.add(plaque)
    }

    setStatue()
    {
        this.statue = {}
        const statue = this.references.items.get('statue')?.[0]
        this.statue.body = statue?.userData?.object?.physical?.body
        this.statue.down = false
    }

    setFWA()
    {
        this.fwa = {}

        // Confetti
        let i = 0
        this.fwa.positions = [
            new THREE.Vector3(23.5, 0, -18.5),
            new THREE.Vector3(27, 0, -19.5),
        ]
        const pop = () =>
        {
            i++
            const position = this.fwa.positions[i % this.fwa.positions.length]
            this.game.world.confetti.pop(position)
            
            setTimeout(pop, 500 + Math.random() * 1500)
        }
        setTimeout(pop, 2000)
        
        // Interactive points
        game.interactivePoints.temporaryHide()

        // Input => start
        this.game.inputs.addActions([
            { name: 'startFWA', categories: [ 'intro', 'modal', 'menu', 'racing', 'cinematic', 'wandering' ], keys: [ 'Keyboard.k' ] },
            { name: 'winFWA', categories: [ 'intro', 'modal', 'menu', 'racing', 'cinematic', 'wandering' ], keys: [ 'Keyboard.j' ] },
        ])
        this.game.inputs.events.on('startFWA', (action) =>
        {
            if(action.active)
            {
                // View
                game.view.zoom.baseRatio = 0.55
                game.view.zoom.ratio = 0.55
                game.view.zoom.smoothedRatio = 0.55
                game.view.focusPoint.position.set(25, 0, -19.2)
                game.view.focusPoint.isTracking = false
                window.setTimeout(() =>
                {
                    this.game.view.setMode(View.MODE_FREE)
                }, 1000)

                // Weather
                this.game.weather.override.start(
                    {
                        humidity: 0,
                        electricField: 0,
                        clouds: 0,
                        wind: 0
                    },
                    0
                )
        
                // Day cycles
                this.game.dayCycles.override.start(
                    {
                        progress: 0.87
                    },
                    0
                )
                
                // Buttons
                document.querySelector('.js-menu-trigger').style.display = 'none'
                document.querySelector('.js-map-trigger').style.display = 'none'
            }
        })
        this.game.inputs.events.on('winFWA', (action) =>
        {
            if(action.active)
            {
                this.game.achievements.setProgress('foty', 1)
            }
        })
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'social')
        })
    }

    update()
    {
        if(this.statue?.body && !this.statue.down && !this.statue.body.isSleeping())
        {
            const statueUp = new THREE.Vector3(0, 1, 0)
            statueUp.applyQuaternion(this.statue.body.rotation())
            if(statueUp.y < 0.25)
            {
                this.statue.down = true
                this.game.achievements.setProgress('statueDown', 1)
            }
        }
    }
}