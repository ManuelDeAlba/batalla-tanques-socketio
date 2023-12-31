const Explosion = require("../Explosion");

class Bala{
    constructor({
        id_jugador,
        x,
        y,
        dano = 1,
        angulo,
        color = "gray"
    }){
        this.id_jugador = id_jugador;
        this.x = x;
        this.y = y;
        this.r = 10;
        this.color = color; 
        this.angulo = angulo;
        this.vel = 6;
        this.dano = dano;

        this.estado = 1;
        this.particulasExplosion = 3;
    }
    mover(mapa){
        // Se mueve la bala
        this.x += Math.cos(this.angulo) * this.vel;
        this.y += Math.sin(this.angulo) * this.vel;

        // Si la bala está fuera del mapa, se borra
        if(mapa.estaFuera(this)) this.estado = 0;
    }
    comprobarColisionesJugadores(jugadores, explosiones){
        // Colisión con jugadores o bots
        jugadores.forEach(jugador => {
            if(jugador.id == this.id_jugador) return;

            let distancia = Math.sqrt((jugador.x - this.x) ** 2 + (jugador.y - this.y) ** 2);

            if(distancia < jugador.r + this.r){
                // Se calcula el ángulo entre el jugador y la bala
                let angulo = Math.atan2(jugador.y - this.y, jugador.x - this.x);

                // Se crea la explosión
                this.crearExplosion({
                    angulo,
                    explosiones
                });

                // Al jugador se le baja la vida por el disparo, el creador es para sumarle puntos por muerte
                jugador.recibirDano({
                    dano: this.dano,
                    creador: jugadores.find(jugador => jugador.id == this.id_jugador)
                })

                // Desaparece la bala
                this.estado = 0;
            }
        })
    }
    comprobarColisionesBalas(balas, explosiones){
        balas.forEach(bala => {
            if(bala.id_jugador == this.id_jugador) return;

            let distancia = Math.sqrt((bala.x - this.x) ** 2 + (bala.y - this.y) ** 2);

            if(distancia < bala.r + this.r){
                // Se calcula el ángulo entre las dos balas
                let angulo = Math.atan2(bala.y - this.y, bala.x - this.x);

                // Se crea la explosión para dibujar solamente cuando la primera bala detecta la colisión
                if(this.estado){
                    this.crearExplosion({
                        angulo,
                        explosiones
                    });
                }

                // Desaparecen las balas
                this.estado = 0;
                bala.estado = 0;
            }
        })
    }
    crearExplosion({angulo, explosiones}){
        for(let i = 0; i < this.particulasExplosion; i++){
            explosiones.push(new Explosion({
                x: this.x + (Math.cos(angulo) * this.r) + -7+Math.random()*14,
                y: this.y + (Math.sin(angulo) * this.r) + -7+Math.random()*14,
                r: this.r
            }));
        }
    }
    obtenerDatosFrontend(){
        return {
            x: this.x,
            y: this.y,
            r: this.r,
            color: this.color,
        }
    }
}

module.exports = Bala;