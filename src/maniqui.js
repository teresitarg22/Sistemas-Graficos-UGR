import { OBJLoader } from '../libs/OBJLoader.js';
import { MTLLoader } from '../libs/MTLLoader.js'
import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.esm.js'

// Esta función se encarga de cambiar el material del objeto pasado por parámetro.
function cambiarMaterial(obj, nuevoMaterial) {
    if (obj instanceof THREE.Mesh) {
        obj.material = nuevoMaterial;
    }
    else if (obj.children.length > 0) {
        obj.children.forEach((child) => {
            cambiarMaterial(child, nuevoMaterial);
        });
    }
}

// ----------------------------------------------------------------------------
// Esta clase es la encargada de crear el modelo jerárquico : un maniquí.
class Maniqui extends THREE.Object3D {
    constructor(radio) {
        super();

        this.maniqui = new THREE.Object3D();

        // ----------- SILUETA -----------
        var material_silueta = new THREE.MeshBasicMaterial({color: '#505050', side: THREE.BackSide});
        
        this.texturaLoader = new THREE.TextureLoader();
        var textura_cuerpo = this.texturaLoader.load("../imgs/maniqui/textura_cuerpo_2.jpg");
        var textura_esferas = this.texturaLoader.load("../imgs/maniqui/textura_cuerpo.jpg");
        var textura_cabeza = this.texturaLoader.load("../imgs/maniqui/textura_cuerpo.jpg")

        // --------------------------------------------------------

        // ----------- RUEDAS -----------
        this.radioRuedas = 0.1;

        var material_esferas = new THREE.MeshLambertMaterial({color: 0xffffff, map: textura_esferas});
        var esfera_geom = new THREE.SphereGeometry(this.radioRuedas);
        this.ruedaIZQ = new THREE.Mesh(esfera_geom, material_esferas);

        this.ruedaDER = this.ruedaIZQ.clone();

        this.ruedaIZQ.position.x = -0.2;
        this.ruedaDER.position.x = 0.2;

        // ----------- PIERNAS -----------
        var piernas_geom = new THREE.CylinderGeometry(0.2, 0.4, 0.8, 20);

        var material_cilindros = new THREE.MeshLambertMaterial({color: 0xEAEAEA, map: textura_cuerpo});
        var piernas = new THREE.Mesh(piernas_geom, material_cilindros);
        piernas.userData = this.maniqui;

        piernas.position.y = 0.4;
        
        // ----------- PARTE INFERIOR ----------- 
        this.parteInferior = new THREE.Object3D().add(piernas, this.ruedaIZQ, this.ruedaDER)
        this.parteInferior.position.y = 0.1;
        this.parteInferior.name = 'parteInferior';

        
        // ----------- HOMBROS ----------- 
        var hombroIZQ = new THREE.Mesh(esfera_geom, material_esferas);
        hombroIZQ.userData = this.maniqui;

        var hombroDER = hombroIZQ.clone();
        hombroDER.userData = this.maniqui;


        // ----------- BRAZOS BASE ----------- 
        var material_brazos = new THREE.MeshLambertMaterial({color: 0xEAEAEA, map: textura_cuerpo});

        var brazos_geom = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
        var brazo_baseIZQ = new THREE.Mesh(brazos_geom, material_brazos);
        brazo_baseIZQ.userData = this.maniqui;
    
        brazo_baseIZQ.position.y = -0.3;
    
        var brazo_baseDER = brazo_baseIZQ.clone();
        brazo_baseDER.userData = this.maniqui;

        // ----------- MANOS ----------- 
        var manoIZQ = new THREE.Mesh(esfera_geom, material_esferas);
        manoIZQ.userData = this.maniqui;
        manoIZQ.scale.set(0.8, 0.8, 0.8);
        manoIZQ.position.y = -0.6;
        var manoDER = manoIZQ.clone();
        manoDER.userData = this.maniqui;

        // ----------- VARITA ----------- 
        var varita = this.createVarita();
        varita.rotation.x = Math.PI + Math.PI/8;

        this.varita = new THREE.Object3D().add(varita);
        this.varita.position.y = -0.6;
        this.varita.name = 'varita';


        // ----------- BRAZOS -----------
        this.brazoIZQ = new THREE.Object3D().add(hombroIZQ, brazo_baseIZQ, manoIZQ);
        this.brazoDER = new THREE.Object3D().add(hombroDER, brazo_baseDER, manoDER);

        var silueta_brazoIZQ = this.brazoIZQ.clone();
        var silueta_brazoDER = this.brazoDER.clone();

        silueta_brazoIZQ.scale.set(1.15, 1.0075, 1.15);
        silueta_brazoDER.scale.set(1.15, 1.0075, 1.15);

        cambiarMaterial(silueta_brazoIZQ, material_silueta);
        cambiarMaterial(silueta_brazoDER, material_silueta);

        silueta_brazoIZQ.visible = false;
        silueta_brazoDER.visible = false;

        this.brazoDER.add(this.varita);

        this.brazoIZQ.add(silueta_brazoIZQ);
        this.brazoDER.add(silueta_brazoDER);

        this.brazoIZQ.rotation.z = -(20*Math.PI) / 180;
        this.brazoDER.rotation.z = (20*Math.PI) / 180;

        this.brazoIZQ.position.x = -0.4;
        this.brazoDER.position.x = 0.4;

        this.brazoIZQ.position.y = 0.4;
        this.brazoDER.position.y = 0.4;

        this.brazoIZQ.name = 'brazoIZQ';
        this.brazoDER.name = 'brazoDER';

        // ----------- TORSO_BASE ----------- 
        var torso_geom = new THREE.CylinderGeometry(0.4, 0.2, 0.5, 20);
        var torso = new THREE.Mesh(torso_geom, material_cilindros);
        torso.userData = this.maniqui;

        torso.position.y = 0.25;

        var silueta_torso = torso.clone();
        silueta_torso.scale.set(1.05, 1.05, 1.05);
        silueta_torso.material = material_silueta;

        silueta_torso.visible = false;

        // ----------- CABEZA BASE + CUELLO ----------- 
        var material_cabeza = new THREE.MeshLambertMaterial({color: 0xffffff, map: textura_cabeza});
        var cabeza_base = new THREE.Mesh(esfera_geom, material_cabeza);
        cabeza_base.userData = this.maniqui;
        cabeza_base.scale.x = 2;    // 0.20
        cabeza_base.scale.y = 2.5;  // 0.25
        cabeza_base.scale.z = 2;    // 0.20

        var cuello = new THREE.Mesh(brazos_geom, material_cilindros);
        cuello.userData = this.maniqui;
        cuello.scale.y = 0.3;       // 0.1

        var silueta_cabeza_base = cabeza_base.clone();
        var silueta_cuello = cuello.clone();

        silueta_cabeza_base.scale.set(cabeza_base.scale.x*1.05, cabeza_base.scale.y*1.05, cabeza_base.scale.z*1.05);
        silueta_cuello.scale.set(cuello.scale.x*1.1, cuello.scale.y*1.1, cuello.scale.z*1.1);

        silueta_cabeza_base.material = material_silueta;
        silueta_cuello.material = material_silueta;

        cuello.position.y = 0.05;
        silueta_cuello.position.y = 0.05;
        cabeza_base.position.y = 0.125 + 0.2;
        silueta_cabeza_base.position.y = 0.125 + 0.2;

        silueta_cuello.visible = false;
        silueta_cabeza_base.visible = false;

        this.cabeza = new THREE.Object3D().add(cabeza_base, cuello, silueta_cabeza_base, silueta_cuello);

        this.cabeza.position.y = 0.5;
        this.cabeza.name = 'cabeza';

        // ----------- PARTE SUPERIOR ----------- 

        this.parteSuperior = new THREE.Object3D().add(this.brazoIZQ, this.brazoDER, torso, silueta_torso, this.cabeza);
        this.parteSuperior.position.y = 0.9;
        this.parteSuperior.name = 'parteSuperior'

        // ------------------------------------------------------

        // ------------------------- SILUETA -------------------------
        var silueta_parteInferior = this.parteInferior.clone();
        silueta_parteInferior.scale.set(1.05, 1.05, 1.05);
        silueta_parteInferior.visible = false;
        cambiarMaterial(silueta_parteInferior, material_silueta);

        this.maniqui.add(this.parteInferior, this.parteSuperior, silueta_parteInferior);
        this.maniqui.name = 'maniqui';

        function setSilueta(booleano) {
            silueta_torso.visible = booleano;
            silueta_cabeza_base.visible = booleano;
            silueta_cuello.visible = booleano;
            silueta_brazoIZQ.visible = booleano;
            silueta_brazoDER.visible = booleano;
            silueta_parteInferior.visible = booleano;
        }

        this.maniqui.setSilueta = setSilueta;
        this.add(this.maniqui);

        // ------------------------------------

        this.hechizoLanzado = false;

        this.movManiqui = new TWEEN.Tween();
        this.rotManiqui = new TWEEN.Tween();
        this.balanceoBrazos = new TWEEN.Tween();
        this.movBrazos = new TWEEN.Tween();

        this.movimientoManiqui(radio);
        this.rotacionManiqui();
        this.movimientoBrazos();
    }

    // -----------------------------------------------
    // Función para crear la varita del maniquí.
    createVarita(){
        // Creamos las variables para cargar el material y el objeto:
        var materialLoader = new MTLLoader();
        var objetoLoader = new OBJLoader();

        // Creo un object3D para guardar la varita:
        var varita_base = new THREE.Object3D();

        materialLoader.load('../modelos/varita/varita.mtl',
        (materiales) => {
            objetoLoader.setMaterials(materiales);
            objetoLoader.load('../modelos/varita/varita.obj',
            (magic) => {
                varita_base.add(magic); // Finalmente añadimos la varita como hijo del Object3D.
            }, null, null);
        });

        // Escalo el objeto, lo translado al centro de los ejes y lo roto 180º en Z.
        varita_base.scale.set(3,3,3);
        varita_base.translateY(17);
        varita_base.rotateZ(Math.PI);

        var varita = new THREE.Object3D().add(varita_base);

        varita.rotation.x = 63.75*Math.PI/180;

        varita = new THREE.Object3D().add(varita);

        varita.position.z = 3.5;

        varita = new THREE.Object3D().add(varita);

        varita.scale.set(0.08, 0.08, 0.08);
    
        var rayo_pos = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1));
        rayo_pos.position.z = 0.7;
        rayo_pos.visible = false;
        rayo_pos.name = 'rayo';

        varita = new THREE.Object3D().add(varita,rayo_pos);
        varita.name = 'varita_original';

        return varita;
    }

    // -------------------------------------------------
    // Función para crear el rayo que lanza el maniquí.
    createRayo(){
        var rayo = new THREE.Shape();
        rayo.moveTo(0, 0);
        rayo.quadraticCurveTo(0.2, 0.15, 0.2, 0.35);
        rayo.quadraticCurveTo(0.2, 0.5, 0.09, 0.85);
        rayo.quadraticCurveTo(0.07, 0.9, 0, 1.5);

        var points = rayo.extractPoints(8).shape;

        var fuego = this.texturaLoader.load('../imgs/textura_fuego_gris.jpg');
        rayo = new THREE.Mesh( new THREE.LatheGeometry(points, 16), new THREE.MeshLambertMaterial({color: '#074207', emissive: '#021602', emissiveMap: fuego, emissiveIntensity: 10}) );

        rayo.scale.set(0.15, 0.2, 0.15);
        rayo.rotation.x = -Math.PI/2;
        rayo.position.z = 1.5*0.2;

        var luz = new THREE.PointLight('#095209', 5, 20);
        luz.position.copy(rayo.position);
        luz.position.z = 1.5*0.2;

        rayo = new THREE.Object3D().add(rayo, luz);
        rayo.name = 'rayo';

        return rayo;
    }

    // -------------------- FUNCIONES DE MOVIMIENTO --------------------

    // -------------------------------------------------
    // Funciones para crear el movimiento continuo que presenta el maniquí.

    movimientoManiqui(distancia){
        var origen = {p: 0.625*distancia};
        var destino = {p: -0.625*distancia};

        this.movManiqui = new TWEEN.Tween(origen)
            .to(destino, 4000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                this.ruedaIZQ.rotation.x = origen.p/this.radioRuedas;
                this.ruedaDER.rotation.x = origen.p/this.radioRuedas;
                this.maniqui.position.z = origen.p;
            })
            .yoyo(true)
            .repeat(Infinity)
            .onComplete(() => { origen.p = 0.625*distancia; })
            .start();
    }

    // --------------------------------- 

    rotacionManiqui(){
        var origen = {p: -Math.PI/4};
        var destino = {p: Math.PI/4};

        this.rotManiqui = new TWEEN.Tween(origen)
            .to(destino, 4000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                this.parteSuperior.rotation.y = origen.p;
            })
            .yoyo(true)
            .repeat(Infinity)
            .onComplete(() => { origen.p = -Math.PI/4; })
            .start();
    }

    // -------------------------------

    movimientoBrazos(){
        var origen = {p: this.brazoDER.rotation.z};
        var destino = {p: this.brazoDER.rotation.z + 0.2};

        this.balanceoBrazos = new TWEEN.Tween(origen)
            .to(destino, 2000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                this.brazoIZQ.rotation.z = -origen.p;
                this.brazoDER.rotation.z = origen.p;
            })
            .yoyo(true)
            .repeat(Infinity)
            .onComplete(() => { origen.p = this.brazoDER.rotation; })
            .start();


        var origen2 = {p: -Math.PI/6};
        var destino2 = {p: Math.PI/6};

        this.movBrazos = new TWEEN.Tween(origen2)
            .to(destino2, 4000)
            .easing(TWEEN.Easing.Cubic.Out)
            .onUpdate(() => {
                this.brazoIZQ.rotation.x = -origen2.p;
                this.brazoDER.rotation.x = origen2.p;
            })
            .yoyo(true)
            .repeat(Infinity)
            .onComplete(() => { origen2.p = -Math.PI/6; })
            .start();
    }

    // ------------------------------------------------------------------------
    // Función para parar el movimiento del maniquí tras clicarle, reposicionandose correctamente:
    stopMovimientoManiqui(){
        var animacion3 = new TWEEN.Tween({p: this.brazoDER.rotation.z, p2: this.brazoDER.rotation.x})
            .to({p: 0, p2: Math.PI/4}, 1500)
            .onUpdate(() => {
                this.brazoDER.rotation.z = animacion3._object.p;
                this.brazoDER.rotation.x = animacion3._object.p2;
            });
        
        // ---------------------

        var animacion2 = new TWEEN.Tween({p: 0, p1: this.brazoDER.rotation.z, p2: /*this.brazoDER.rotation.x*/0, p2_2: this.brazoDER.rotation.x, p3: 0})
            .to({p: -Math.PI/4, p1: 0, p2: Math.PI/4, p2_2: Math.PI/4, p3: -Math.PI/6}, 1500)
            .onUpdate(() => {
                this.parteSuperior.rotation.x = animacion2._object.p;
                this.brazoDER.rotation.z = animacion2._object.p1;
                this.brazoDER.rotation.x = animacion2._object.p2_2;
                this.brazoIZQ.rotation.z = -animacion2._object.p1;
                this.brazoIZQ.rotation.x = animacion2._object.p2;
                this.cabeza.rotation.x = animacion2._object.p3;
            })
        
        // ---------------------

        var animacion1_1 = new TWEEN.Tween({P: 2*Math.PI/6})
            .to({P: 0}, 75)
            .onUpdate(() => {
                this.parteSuperior.rotation.y = animacion1_1._object.P;
            })
            .chain(animacion2);

        // ---------------------

        var animacion1 = new TWEEN.Tween({p: -2*Math.PI/6})
            .to({p: 2*Math.PI/6}, 150)
            .onUpdate(() => {
                this.parteSuperior.rotation.y = animacion1._object.p;
            })
            .yoyo(true)
            .repeat(20)
            .chain(animacion1_1);

        // ---------------------

        var animacion = new TWEEN.Tween({p: 0})
            .to({p: -2*Math.PI/6}, 75)
            .onUpdate(() => {
                this.parteSuperior.rotation.y = animacion._object.p;
            })
            .chain(animacion1);
            
        setTimeout(() => { animacion.start(); }, 1500);
    }

    // ---------------------------------------------------------------
    // Función para lanzar el hechizo del maniquí

    lanzarHechizo(escena){

        if (!this.hechizoLanzado) {
            this.hechizoLanzado = true;

            escena.getObjectByName('papel2').visible = true;

            this.movManiqui.stop();
            this.rotManiqui.stop();
            this.balanceoBrazos.stop();
            this.movBrazos.stop();

            var esfera = escena.getObjectByName('cono_raro').getObjectByName('objeto_raro').getObjectByName('esfera')

            var pos = this.position;

            // --------------------------------------------------
            var punto = new THREE.Vector3();
            esfera.getWorldPosition(punto);

            var p = new THREE.Vector3();
            var rayo = this.createRayo();

            var luz = new THREE.PointLight('#095209', 0, 0);
            luz.position.copy(punto);
            luz.visible = false;
            escena.add(luz);

            // ----------------------------
            luz.castShadow = true;
            luz.shadow.mapSize.width = 512;
            luz.shadow.mapSize.height = 512;
            luz.shadow.camera.near = 0.5;
            luz.shadow.camera.far = 500;

            esfera.material.emissive = new THREE.Color('#095209');
            esfera.material.emissiveIntensity = 0;

            // ---------------------

            var animacionPapel = new TWEEN.Tween({p: 0}).to({p : 1}, 7500)
                .onUpdate(() => {
                    escena.getObjectByName('papel2').material.opacity = animacionPapel._object.p;
                });

            // ---------------------

            var animacionEsfera = new TWEEN.Tween({p: 0, p2: 0})
                .to({p: 300, p2: 200}, 3000)
                .onUpdate(() => {
                    luz.intensity = animacionEsfera._object.p;
                    luz.distance = animacionEsfera._object.p2;
                    esfera.material.emissiveIntensity = animacionEsfera._object.p;
                })
                .chain(animacionPapel)
                .yoyo(true)
                .repeat(1)
                .onComplete(() => {
                    escena.decoracion.videoElement.play();
                    luz.visible = false;
                });

            // ---------------------

            var animacionHechizo = new TWEEN.Tween({var: p})
                .to({var: punto}, 1250)
                .onUpdate(() => {
                    rayo.position.copy(animacionHechizo._object.var);
                })
                .chain(animacionEsfera)
                .onComplete(() => {
                    luz.visible = true;
                    rayo.visible = false;
                });

            // ---------------------

            var animacion3 = new TWEEN.Tween({p: 0.2, p2: 0})
                .to({p: -(Math.PI/2-Math.atan2(pos.z,0.4)), p2: Math.PI/2 + Math.atan2(punto.y-(1.3+pos.y),pos.z)}, 1000)
                .onUpdate(() => {
                    this.brazoDER.rotation.z = animacion3._object.p;
                    this.brazoDER.rotation.x = animacion3._object.p2;
                })
                .delay(250)
                .chain(animacionHechizo)
                .onComplete(() => {
                    escena.getObjectByName('maniqui')
                        .getObjectByName('parteSuperior')
                        .getObjectByName('brazoDER')
                        .getObjectByName('varita')
                        .getObjectByName('varita_original')
                        .getObjectByName('rayo')
                        .getWorldPosition(p);

                    rayo.position.copy(p);
                    rayo.lookAt(punto);
                    escena.add(rayo);

                    setTimeout(() => { this.stopMovimientoManiqui(); }, 6000);
                });
            
            // ---------------------
            
            var animacion2 = new TWEEN.Tween({p: 0})
                .to({p: Math.PI/2+Math.PI/8}, 300)
                .onUpdate(() => {
                    this.varita.rotation.x = -animacion2._object.p;
                })
                .delay(150)
                .chain(animacion3);

            // ---------------------    

            var animacion = new TWEEN.Tween({p: this.parteSuperior.rotation.y, p2: this.brazoDER.rotation.z, p3: this.brazoDER.rotation.x})
                .to({p: 0, p2: 0.2, p3: 0}, 2000)
                .onUpdate(() => {
                    this.parteSuperior.rotation.y = animacion._object.p;
                    this.brazoDER.rotation.z = animacion._object.p2;
                    this.brazoIZQ.rotation.z = -animacion._object.p2;
                    this.brazoDER.rotation.x = animacion._object.p3;
                    this.brazoIZQ.rotation.x = -animacion._object.p3;
                })
                .chain(animacion2)
                .onComplete(() => {
                    this.parteSuperior.rotation.y = 0;
                    this.brazoDER.rotation.z = 0.2;
                    this.brazoIZQ.rotation.z = -0.2;
                    this.brazoDER.rotation.x = 0;
                    this.brazoIZQ.rotation.x = 0;
                });
            
            setTimeout(() => { animacion.start(); }, 1000);
        }
    }
}

export { Maniqui };