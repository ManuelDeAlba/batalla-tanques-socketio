const { v1: uuidv1 } = require("uuid");

const { degToRad, radToDeg, enteroAleatorio, convertirAGrados } = require("../../utils");
const Tanque = require("./Tanque");
const Bala = require("./Bala");

class Bot extends Tanque{
    constructor(mapa){
        super({
            mapa,
            id: uuidv1(),
            nombre: "Bot",
            color: "red"
        });

        // Propiedades que solo tienen los bots
        this.atacando = false;
        this.i = 0;
        this.avanzar = 0;
        this.tiempoAvanzar = enteroAleatorio(30, 60);
        this.giro = 0;
        this.tiempoGiro = 60;
        this.tiempoDisparar = enteroAleatorio(10, 30);

        this.objetivo = undefined;
        this.distanciaMaxima = 200;
        this.direccionApuntado = enteroAleatorio(0, 1) == 1 ? 1 : -1;
    }
    mover(mapa){
        // Contador para las acciones del bot
        this.i++;

        // Aleatoriamente se selecciona la dirección de giro y para avanzar
        if(this.i % this.tiempoGiro == 0) this.giro = enteroAleatorio(-1, 1);
        if(this.i % this.tiempoAvanzar == 0){
            // Si no está atacando, la probabilidad de caminar o no, es del 50%
            if(!this.atacando) this.avanzar = enteroAleatorio(0, 1);
            // Si está atacando, la probabilidad de caminar es solo de 20% para simular que está concentrado atacando
            else this.avanzar = enteroAleatorio(1, 10) <= 8 ? 0 : 1;
        }

        // Movimiento hacia adelante o quieto
        this.x += Math.cos(degToRad(this.angulo)) * this.vel * this.avanzar;
        this.y += Math.sin(degToRad(this.angulo)) * this.vel * this.avanzar;

        // Giros
        // Si está atacando, ignora el this.giro y voltea hacia el jugador automáticamente
        if(this.atacando){
            let anguloFinal = radToDeg(Math.atan2(this.y - this.objetivo.y, this.x - this.objetivo.x)) + 180;

            // Primero revisamos hacia donde va a girar para que sea más rápido
            let direccion = this.obtenerDireccionGiroOptima(anguloFinal);

            // Aquí ya aplica los movimientos reales sabiendo la dirección a la que tiene que girar para que sea más óptimo
            if(convertirAGrados(this.angulo) != anguloFinal){
                // Se mueve hacia el lado que se calculó
                this.angulo += this.velAngulo * direccion;

                // Si ya está lo suficientemente cerca, se acomoda el ángulo que haga falta para que no se pase
                if(convertirAGrados(this.angulo - anguloFinal) < this.velAngulo){
                    this.angulo = anguloFinal;
                }
            }
        } else {
            this.angulo += this.velAngulo * this.giro;
        }

        // Evitar que se salga por los bordes del mapa
        if(this.x - this.r < mapa.x) this.x = mapa.x + this.r;
        if(this.x + this.r > mapa.x + mapa.w) this.x = mapa.x + mapa.w - this.r;
        if(this.y - this.r < mapa.y) this.y = mapa.y + this.r;
        if(this.y + this.r > mapa.y + mapa.h) this.y = mapa.y + mapa.h - this.r;
    }
    comprobarDisparos(balas, jugadores){
        // Se obtiene la distancia del jugador más cercano (también guarda su posición en this.objetivo)
        let [objetivo, distanciaObjetivo] = this.obtenerObjetivoMasCercano(jugadores);
        this.objetivo = objetivo;

        // Si ya tiene un objetivo y la distancia está dentro del rango
        if(this.objetivo && distanciaObjetivo < this.distanciaMaxima){
            // Se pone al bot en modo ataque (se queda quieto y se mueve para apuntar al jugador)
            this.atacando = true;

            // Después de cada cierto tiempo, dispara
            if(this.i % this.tiempoDisparar == 0){
                // Crea la bala en la posición del bot
                balas.push(new Bala({
                    id_jugador: this.id, // Para no contar la colisión con el que disparó
                    x: this.x + Math.cos(degToRad(this.angulo)) * this.r * 1.5,
                    y: this.y + Math.sin(degToRad(this.angulo)) * this.r * 1.5,
                    dano: this.dano,
                    angulo: degToRad(this.angulo),
                    color: this.color
                }));
            }
        } else {
            this.atacando = false;
        }
    }
    obtenerObjetivoMasCercano(jugadores){
        let objetivo;
        let distanciaObjetivo = undefined;

        // Comprueba la distancia con todos los jugadores y obtiene al más cercano
        jugadores.forEach(jugador => {
            // Si es el mismo bot, entonces se salta
            if(jugador.id == this.id) return;

            let distancia = Math.sqrt((this.x - jugador.x) ** 2 + (this.y - jugador.y) ** 2);

            // Si la distancia es menor con ese nuevo objetivo,
            // se guardan sus datos para después calcular el ángulo y girarse
            if(distancia < distanciaObjetivo || distanciaObjetivo == undefined){
                distanciaObjetivo = distancia;

                objetivo = {
                    id: jugador.id,
                    x: jugador.x,
                    y: jugador.y
                };
            }
        })

        return [
            objetivo,
            distanciaObjetivo
        ];
    }
}

module.exports = Bot;