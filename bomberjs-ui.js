function criaJogo(id) {
	return iniciaJogoNovo(13, 13, 4, id, 'imagens.png');
};

function iniciaJogoNovo(altura, largura, inimigos, id, imagemSrc) {
	var imagem = new Image();
	imagem.onload = function() {
		var mapa = new Mapa(altura, largura);
		mapa.criaBlocosEstaticos();
		mapa.criaBlocos();
		mapa.criaPremios();
		mapa.criaInimigos(inimigos);
		mapa.criaPersonagem();
		var mapaUi = new MapaUi(mapa, id, imagem);
	}
	imagem.src = imagemSrc;
}

function MapaUi(mapa, id, imagem) {
	this.mapa = mapa;
	
	//indices para as imagens dos blocos
    this.indices = {};
	this.indices.blocoEstatico = 0;
    this.indices.bloco = 1;	
	this.indices.personagem = 2;
    this.indices.inimigo = 3;
	this.indices.explosaoX = 4;
	this.indices.explosaoC = 5;
    this.indices.explosaoY = 6;
    this.indices.bomba = 7;
    this.indices.premios = 8;
	
	this.imagem = imagem;
    this.tamanhoBloco = this.imagem.height;

    // outro nome para this poder ser usado nas closure
    var ui = this;

    // criar um link que server para reinicar o jogo
    var novo = document.createElement("a");
    novo.textContent = "Novo";
    novo.href = "javascript:";
    novo.addEventListener('click', function(e) {ui.reiniciar()}, false);
	
	this.canvas = document.createElement("canvas");
    this.canvas.width = this.tamanhoBloco * this.mapa.largura;
    this.canvas.height = this.tamanhoBloco * this.mapa.altura;
	this.context = this.canvas.getContext("2d");
	//this.context.globalCompositeOperation = "destination-over";
	
	window.addEventListener("keydown", function (e){ui.trataPressionaTecla(e.which)}, false);
	window.addEventListener("keyup", function (e){ui.trataSoltaTecla(e.which)}, false);
	
    // criar uma barra de informação
    this.info = document.createElement('div');
	
	// Nomeia teclas
	this.teclaEsquerda = 37;
	this.teclaSobe = 38;
	this.teclaDireita = 39;
	this.teclaDesce = 40;
	this.bomba = 32;
	
   
    // adiciona os elementos criados ao elemento onde ficará o jogo
    var alvo = document.getElementById(id);
    alvo.appendChild(document.createElement('br'));
    alvo.appendChild(this.canvas);
    alvo.appendChild(this.info);

    this.iniciaPersonagens();
}

MapaUi.prototype = {
	// Seta movimento do jogador pela tecla pressionada
    trataPressionaTecla: function (e) {
		if (e == this.teclaEsquerda) {
			this.mapa.personagem.esquerda = true;
		} else if (e == this.teclaSobe) {
			this.mapa.personagem.sobe = true;
		} else if (e == this.teclaDireita) {
			this.mapa.personagem.direita = true;
		} else if (e == this.teclaDesce) {
			this.mapa.personagem.desce = true;
		} else if (e == this.bomba) {
			this.criaBomba(this.forca);
		};
        
    },
	//Para de movimentar quando jogador solta a tecla
	trataSoltaTecla: function (e) {
		if (e == this.teclaEsquerda) {
			this.mapa.personagem.esquerda = false;
		} else if (e == this.teclaSobe) {
			this.mapa.personagem.sobe = false;
		} else if (e == this.teclaDireita) {
			this.mapa.personagem.direita = false;
		} else if (e == this.teclaDesce) {
			this.mapa.personagem.desce = false;
		};
	},
	// Retorna posição para o contexto
	posicaoDesenho: function (posicao) {
		return posicao*this.tamanhoBloco;
	},
	// Retorna o indice para as lista de objetos
	pegaIndice: function (posicao) {
		return parseInt(posicao/this.tamanhoBloco);
	},
	//Desenha Blocos Estáticos de acordo com a lista de blocos estáticos
	desenhaBlocosEstaticos: function () {
		for ( var i = 0; i < this.mapa.blocosEstaticos.length; i += 1) {
		this.context.drawImage(this.imagem, this.posicaoDesenho(this.indices.blocoEstatico), 0, this.tamanhoBloco,
			this.tamanhoBloco, this.posicaoDesenho(this.mapa.blocosEstaticos[i].coluna), this.posicaoDesenho(this.mapa.blocosEstaticos[i].linha),
			this.tamanhoBloco, this.tamanhoBloco)
		}
	},
	//Desenha Blocos de acordo com a lista de blocos
	desenhaBlocos: function () {
		for ( var i = 0; i < this.mapa.blocos.length; i += 1) {
		this.context.drawImage(this.imagem, this.posicaoDesenho(this.indices.bloco), 0, this.tamanhoBloco,
			this.tamanhoBloco, this.posicaoDesenho(this.mapa.blocos[i].coluna), this.posicaoDesenho(this.mapa.blocos[i].linha),
			this.tamanhoBloco, this.tamanhoBloco)
		}
		this.context.restore();
	},
	//Desenha Inimigos
	desenhaInimigos: function (cordenadaX, cordenadaY) {
		this.context.drawImage(this.imagem, this.posicaoDesenho(this.indices.inimigo), 0, this.tamanhoBloco,
			this.tamanhoBloco, cordenadaX, cordenadaY, this.tamanhoBloco, this.tamanhoBloco)
	},
	//Dsenha bomberJS
	desenhaPersonagem: function (cordenadaX, cordenadaY) {
		this.context.drawImage(this.imagem, this.posicaoDesenho(this.indices.personagem), 0, this.tamanhoBloco,
			this.tamanhoBloco, cordenadaX, cordenadaY, this.tamanhoBloco, this.tamanhoBloco)
	},
	//Desenha Premios
	desenhaPremios: function () {
		for ( var i = 0; i < this.mapa.premios.length; i += 1) {
			this.context.drawImage(this.imagem, this.posicaoDesenho(this.indices.premios+this.mapa.premios[i].tipoPremio), 0, this.tamanhoBloco,
				this.tamanhoBloco, this.posicaoDesenho(this.mapa.premios[i].coluna), this.posicaoDesenho(this.mapa.premios[i].linha),
				this.tamanhoBloco, this.tamanhoBloco);
		}
	},
	// Anima os movimentos e processa colisões
	anima: function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.desenhaBombas();
		this.desenhaBlocosEstaticos();
		this.desenhaPremios();
		this.desenhaBlocos();
		this.movimentaJogador(this.velocidade);
		this.movimentaInimigos();
		var _this = this;
		if ( !this.mapa.jogoAcabou ){
			window.setTimeout(function(){
				_this.anima();
				}, 33);
		} else {
			if ( this.mapa.jogadorVenceu ) {
				alert('Fim de Jogo. Voce Venceu. YAH \o/')
			} else {
				alert('Fim de Jogo. Voce morreu. =// ')
			}
		}
	},
	//Movimenta Personagem
	movimentaJogador: function (deslocamento) {
	for ( var i = 0; i < deslocamento; i += 1) {
			if ( this.mapa.personagem.sobe ) {
				var linhaDestino = this.pegaIndice(this.mapa.personagem.linha - 1);
				var colunaDestino = this.pegaIndice(this.mapa.personagem.coluna);
				var temBloco = this.mapa.temBloco(linhaDestino, colunaDestino);
				var temBlocoEstatico = this.mapa.temBlocoEstatico(linhaDestino, colunaDestino);
				if ( this.posicaoDesenho(colunaDestino) == this.mapa.personagem.coluna ) {
					if ( temBloco == 'nao' && temBlocoEstatico == 'nao' &&
						( this.mapa.personagem.linha - 1 >= 0 )) {
						this.mapa.personagem.linha -= 1;
						this.processaPremio(linhaDestino, colunaDestino);
					}
				}
			} 
			if ( this.mapa.personagem.desce ) {
				var linhaDestino = this.pegaIndice(this.mapa.personagem.linha + this.tamanhoBloco);
				var colunaDestino = this.pegaIndice(this.mapa.personagem.coluna);
				var temBloco = this.mapa.temBloco(linhaDestino, colunaDestino);
				var temBlocoEstatico = this.mapa.temBlocoEstatico(linhaDestino, colunaDestino);
				if ( this.posicaoDesenho(colunaDestino) == this.mapa.personagem.coluna ) {
					if ( temBloco == 'nao' && temBlocoEstatico == 'nao' &&
						( this.mapa.personagem.linha + this.tamanhoBloco < this.canvas.height )) {
						this.mapa.personagem.linha += 1;
						this.processaPremio(linhaDestino, colunaDestino);
					}
				}
			}
			if ( this.mapa.personagem.direita ) {
				var linhaDestino = this.pegaIndice(this.mapa.personagem.linha );
				var colunaDestino = this.pegaIndice(this.mapa.personagem.coluna + this.tamanhoBloco);
				var temBloco = this.mapa.temBloco(linhaDestino, colunaDestino);
				var temBlocoEstatico = this.mapa.temBlocoEstatico(linhaDestino, colunaDestino);
				if (this.posicaoDesenho(linhaDestino) == this.mapa.personagem.linha) {
					if ( temBloco == 'nao' && temBlocoEstatico == 'nao' && 
						(this.mapa.personagem.coluna + this.tamanhoBloco) < this.canvas.width ) {
						this.mapa.personagem.coluna += 1;
						this.processaPremio(linhaDestino, colunaDestino);
					}
				}
			}
			if ( this.mapa.personagem.esquerda ) {
				var linhaDestino = this.pegaIndice(this.mapa.personagem.linha );
				var colunaDestino = this.pegaIndice(this.mapa.personagem.coluna - 1);
				var temBloco = this.mapa.temBloco(linhaDestino, colunaDestino);
				var temBlocoEstatico = this.mapa.temBlocoEstatico(linhaDestino, colunaDestino);
				if (this.posicaoDesenho(linhaDestino) == this.mapa.personagem.linha) {
					if ( temBloco == 'nao' && temBlocoEstatico == 'nao' && 
						(this.mapa.personagem.coluna - 1) >= 0 ) {
						this.mapa.personagem.coluna -= 1;
						this.processaPremio(linhaDestino, colunaDestino);
					}
				}
			}
		}
		this.desenhaPersonagem(this.mapa.personagem.coluna, this.mapa.personagem.linha);
	},
	//Decide direção inimigos
	decideDirecaoInimigos: function (indice) {
		var direcao = randint(0, 4); //0 Sobe, 1 Desce, 2 Direita, 3 Esquerda
		switch(direcao) {
			case 0:
				this.mapa.inimigos[indice].sobe = true
				this.mapa.inimigos[indice].desce = false
				this.mapa.inimigos[indice].direita = false
				this.mapa.inimigos[indice].esquerda = false
				break;
			case 1:
				this.mapa.inimigos[indice].sobe = false
				this.mapa.inimigos[indice].desce = true
				this.mapa.inimigos[indice].direita = false
				this.mapa.inimigos[indice].esquerda = false
				break;
			case 2:
				this.mapa.inimigos[indice].sobe = false
				this.mapa.inimigos[indice].desce = false
				this.mapa.inimigos[indice].direita = true
				this.mapa.inimigos[indice].esquerda = false
				break;
			case 3:
				this.mapa.inimigos[indice].sobe = false
				this.mapa.inimigos[indice].desce = false
				this.mapa.inimigos[indice].direita = false
				this.mapa.inimigos[indice].esquerda = true
				break;
		}
	},
	//Inicia Personagens na tela
	iniciaPersonagens: function () {
		this.velocidade = 4;
		this.forca = 1;
		this.numBombas = 1;
		this.desenhaPersonagem(this.posicaoDesenho(this.mapa.personagem.coluna), this.posicaoDesenho(this.mapa.personagem.linha));
		for ( var i = 0; i < this.mapa.inimigos.length; i += 1) {
			//Gera Direcao aleatória para inimigos
			this.decideDirecaoInimigos(i);
			//Converte indice de inimigos para posicao no canvas
			this.mapa.inimigos[i].coluna = this.posicaoDesenho(this.mapa.inimigos[i].coluna);
			this.mapa.inimigos[i].linha = this.posicaoDesenho(this.mapa.inimigos[i].linha);
			this.desenhaInimigos(this.mapa.inimigos[i].coluna, this.mapa.inimigos[i].linha);
		}
	this.anima()
	},
	//Movimenta Inimigos Aleatoriamente
	movimentaInimigos: function () {
		var movimento = 2;
		for ( var i = 0; i < this.mapa.inimigos.length; i += 1) {
			if ( this.mapa.inimigos[i].sobe ) {
				var linhaDestino = this.pegaIndice(this.mapa.inimigos[i].linha - movimento);
				var colunaDestino = this.pegaIndice(this.mapa.inimigos[i].coluna);
				if ( this.mapa.temBloco(linhaDestino, colunaDestino) == 'nao' &&
				this.mapa.temBlocoEstatico(linhaDestino, colunaDestino) == 'nao' &&
				this.mapa.temBomba(linhaDestino, colunaDestino) == 'nao' &&
				(this.mapa.inimigos[i].linha - movimento) >= 0 ) {
					this.mapa.inimigos[i].linha -= movimento;
				} else {
					this.decideDirecaoInimigos(i);
				}
			} else if ( this.mapa.inimigos[i].desce ) {
				var linhaDestino = this.pegaIndice(this.mapa.inimigos[i].linha + movimento + this.tamanhoBloco -1);
				var colunaDestino = this.pegaIndice(this.mapa.inimigos[i].coluna);
				if ( this.mapa.temBloco(linhaDestino, colunaDestino) == 'nao' && 
				this.mapa.temBlocoEstatico(linhaDestino, colunaDestino) == 'nao' && 
				this.mapa.temBomba(linhaDestino, colunaDestino) == 'nao' &&
				(this.mapa.inimigos[i].linha + movimento + this.tamanhoBloco -1 )  <= this.canvas.height ) {
					this.mapa.inimigos[i].linha += movimento;
				} else {
					this.decideDirecaoInimigos(i);
				}
			}else if ( this.mapa.inimigos[i].direita ) {
				var linhaDestino = this.pegaIndice(this.mapa.inimigos[i].linha );
				var colunaDestino = this.pegaIndice(this.mapa.inimigos[i].coluna + movimento + this.tamanhoBloco -1);
				if ( this.mapa.temBloco(linhaDestino, colunaDestino) == 'nao' && 
				this.mapa.temBlocoEstatico(linhaDestino, colunaDestino) == 'nao' && 
				this.mapa.temBomba(linhaDestino, colunaDestino) == 'nao' &&
				(this.mapa.inimigos[i].coluna + movimento + this.tamanhoBloco -1 ) <= this.canvas.width ) {
					this.mapa.inimigos[i].coluna += movimento;
				} else {
					this.decideDirecaoInimigos(i);
				}
			}else if ( this.mapa.inimigos[i].esquerda ) {
				var linhaDestino = this.pegaIndice(this.mapa.inimigos[i].linha);
				var colunaDestino = this.pegaIndice(this.mapa.inimigos[i].coluna - movimento);
				if ( this.mapa.temBloco(linhaDestino, colunaDestino) == 'nao' && 
				this.mapa.temBlocoEstatico(linhaDestino, colunaDestino) == 'nao' && 
				this.mapa.temBomba(linhaDestino, colunaDestino) == 'nao' &&
				(this.mapa.inimigos[i].coluna - movimento) >= 0 ) {
					this.mapa.inimigos[i].coluna -= movimento;
				} else {
					this.decideDirecaoInimigos(i);
				}
			}
			this.desenhaInimigos(this.mapa.inimigos[i].coluna, this.mapa.inimigos[i].linha);
			if ( ( this.pegaIndice(this.mapa.inimigos[i].linha) == this.pegaIndice(this.mapa.personagem.linha) &&
				this.pegaIndice(this.mapa.inimigos[i].coluna) == this.pegaIndice(this.mapa.personagem.coluna) ) ||
				( this.pegaIndice(this.mapa.inimigos[i].linha) == (this.pegaIndice(this.mapa.personagem.linha) -1) &&
				this.pegaIndice(this.mapa.inimigos[i].coluna) == this.pegaIndice(this.mapa.personagem.coluna) && 
				this.mapa.personagem.coluna != this.posicaoDesenho(this.pegaIndice(this.mapa.personagem.coluna))) ||
				( (this.pegaIndice(this.mapa.inimigos[i].linha) -1 ) == this.pegaIndice(this.mapa.personagem.linha) &&
				this.pegaIndice(this.mapa.inimigos[i].coluna) == this.pegaIndice(this.mapa.personagem.coluna) && 
				this.mapa.personagem.linha != this.posicaoDesenho(this.pegaIndice(this.mapa.personagem.linha)))) {
				this.mapa.jogoAcabou = true;
			}
		}
	},
	//Cria uma bomba
	criaBomba: function (forca) {
		if ( this.mapa.bombas.length < this.numBombas){
			this.mapa.criaBomba(this.pegaIndice(this.mapa.personagem.linha+(this.tamanhoBloco/2)),
				this.pegaIndice(this.mapa.personagem.coluna+(this.tamanhoBloco/2)), forca);
		}
	},
	//Desenha bombas na tela	
	desenhaBombas: function () {
		for ( var i = 0; i < this.mapa.bombas.length; i += 1) {
			if ( this.mapa.bombas[i].tempo == 0 ) {
				var direita = true;
				var esquerda = true;
				var sobe = true;
				var desce = true;
				this.mapa.explodeBombaBloco(i); //Destroi Blocos
				for ( var j = 0; j <= this.mapa.bombas[i].forca; j += 1) {
					if ( j == 0 ) {
						this.context.drawImage(this.imagem, this.posicaoDesenho(this.indices.explosaoC), 0, this.tamanhoBloco,
							this.tamanhoBloco, this.posicaoDesenho(this.mapa.bombas[i].coluna), this.posicaoDesenho(this.mapa.bombas[i].linha),
							this.tamanhoBloco, this.tamanhoBloco);
						if ( this.mapa.bombas[i].coluna == this.pegaIndice(this.mapa.personagem.coluna) && 
							this.mapa.bombas[i].linha == this.pegaIndice(this.mapa.personagem.linha) ) {
							this.mapa.jogoAcabou = true;
						}
						for ( var k = 0; k < this.mapa.inimigos.length; k += 1) {
							if ( this.mapa.bombas[i].coluna == this.pegaIndice(this.mapa.inimigos[k].coluna) && 
								this.mapa.bombas[i].linha == this.pegaIndice(this.mapa.inimigos[k].linha) ) {
								this.mapa.explodeInimigos(k);
							}
						}
					} else {
						if ( (this.mapa.temBlocoEstatico(this.mapa.bombas[i].linha, this.mapa.bombas[i].coluna + j) == 'nao') && direita ) {
							this.context.drawImage(this.imagem, this.posicaoDesenho(this.indices.explosaoX), 0, this.tamanhoBloco,
								this.tamanhoBloco, this.posicaoDesenho(this.mapa.bombas[i].coluna + j), this.posicaoDesenho(this.mapa.bombas[i].linha),
								this.tamanhoBloco, this.tamanhoBloco);
							if ( (this.mapa.bombas[i].coluna + j) == this.pegaIndice(this.mapa.personagem.coluna) && 
								this.mapa.bombas[i].linha == this.pegaIndice(this.mapa.personagem.linha) ||
								((this.mapa.bombas[i].coluna + j) == this.pegaIndice(this.mapa.personagem.coluna) && 
								(this.mapa.bombas[i].linha -1 ) == this.pegaIndice(this.mapa.personagem.linha)) &&
								this.mapa.personagem.linha != this.posicaoDesenho(this.pegaIndice(this.mapa.personagem.linha))){
								this.mapa.jogoAcabou = true;
							}
							for ( var k = 0; k < this.mapa.inimigos.length; k += 1 ) {
								if ( (this.mapa.bombas[i].coluna + j) == this.pegaIndice(this.mapa.inimigos[k].coluna) && 
									this.mapa.bombas[i].linha == this.pegaIndice(this.mapa.inimigos[k].linha) ||
									((this.mapa.bombas[i].coluna + j) == this.pegaIndice(this.mapa.inimigos[k].coluna) && 
									(this.mapa.bombas[i].linha -1 ) == this.pegaIndice(this.mapa.inimigos[k].linha)) &&
									this.mapa.inimigos[i].linha != this.posicaoDesenho(this.pegaIndice(this.mapa.inimigos[k].linha))){
									this.mapa.explodeInimigos(k);
								}
							}
						} else {
							direita = false;
						}
						if ( (this.mapa.temBlocoEstatico(this.mapa.bombas[i].linha, this.mapa.bombas[i].coluna - j) == 'nao') && esquerda ) {
							this.context.drawImage(this.imagem, this.posicaoDesenho(this.indices.explosaoX), 0, this.tamanhoBloco,
								this.tamanhoBloco, this.posicaoDesenho(this.mapa.bombas[i].coluna - j), this.posicaoDesenho(this.mapa.bombas[i].linha),
								this.tamanhoBloco, this.tamanhoBloco);
							if (((this.mapa.bombas[i].coluna - j) == this.pegaIndice(this.mapa.personagem.coluna) && 
								this.mapa.bombas[i].linha == this.pegaIndice(this.mapa.personagem.linha) ) || 
								((this.mapa.bombas[i].coluna - j - 1) == this.pegaIndice(this.mapa.personagem.coluna) && 
								this.mapa.bombas[i].linha == this.pegaIndice(this.mapa.personagem.linha) &&
								this.mapa.personagem.coluna != this.posicaoDesenho(this.pegaIndice(this.mapa.personagem.coluna))) || 
								((this.mapa.bombas[i].coluna - j) == this.pegaIndice(this.mapa.personagem.coluna) && 
								(this.mapa.bombas[i].linha - 1)  == this.pegaIndice(this.mapa.personagem.linha) &&
								this.mapa.personagem.linha != this.posicaoDesenho(this.pegaIndice(this.mapa.personagem.linha)))) {
								this.mapa.jogoAcabou = true;
							}
							for ( var k = 0; k < this.mapa.inimigos.length; k += 1 ) {
								if (((this.mapa.bombas[i].coluna - j) == this.pegaIndice(this.mapa.inimigos[k].coluna) && 
									this.mapa.bombas[i].linha == this.pegaIndice(this.mapa.inimigos[k].linha) ) || 
									((this.mapa.bombas[i].coluna - j - 1) == this.pegaIndice(this.mapa.inimigos[k].coluna) && 
									this.mapa.bombas[i].linha == this.pegaIndice(this.mapa.inimigos[k].linha) &&
									this.mapa.inimigos[k].coluna != this.posicaoDesenho(this.pegaIndice(this.mapa.inimigos[k].coluna))) || 
									((this.mapa.bombas[i].coluna - j - 1) == this.pegaIndice(this.mapa.inimigos[k].coluna) && 
									(this.mapa.bombas[i].linha - 1)  == this.pegaIndice(this.mapa.inimigos[k].linha) &&
									this.mapa.inimigos[k].linha != this.posicaoDesenho(this.pegaIndice(this.mapa.inimigos[k].linha)))) {
									this.mapa.explodeInimigos(k);
								}
							}
						} else {
							esquerda = false;
						}
						if ( (this.mapa.temBlocoEstatico(this.mapa.bombas[i].linha + j, this.mapa.bombas[i].coluna) == 'nao') && desce ) {
							this.context.drawImage(this.imagem, this.posicaoDesenho(this.indices.explosaoY), 0, this.tamanhoBloco,
								this.tamanhoBloco, this.posicaoDesenho(this.mapa.bombas[i].coluna), this.posicaoDesenho(this.mapa.bombas[i].linha + j),
								this.tamanhoBloco, this.tamanhoBloco);
							if ((this.mapa.bombas[i].coluna == this.pegaIndice(this.mapa.personagem.coluna) && 
								(this.mapa.bombas[i].linha + j) == this.pegaIndice(this.mapa.personagem.linha) ) || 
								((this.mapa.bombas[i].coluna -1) == this.pegaIndice(this.mapa.personagem.coluna) &&
								this.mapa.personagem.coluna != this.posicaoDesenho(this.pegaIndice(this.mapa.personagem.coluna)) &&
								(this.mapa.bombas[i].linha + j) == this.pegaIndice(this.mapa.personagem.linha) )) {
								this.mapa.jogoAcabou = true;
							}
							for ( var k = 0; k < this.mapa.inimigos.length; k +=1 ) {
								if ((this.mapa.bombas[i].coluna == this.pegaIndice(this.mapa.inimigos[k].coluna) && 
									(this.mapa.bombas[i].linha + j) == this.pegaIndice(this.mapa.inimigos[k].linha) ) || 
									((this.mapa.bombas[i].coluna -1) == this.pegaIndice(this.mapa.inimigos[k].coluna) &&
									this.mapa.inimigos[k].coluna != this.posicaoDesenho(this.pegaIndice(this.mapa.inimigos[k].coluna)) &&
									(this.mapa.bombas[i].linha + j) == this.pegaIndice(this.mapa.inimigos[k].linha) )) {
									this.mapa.explodeInimigos(k);
								}
							}
						} else {
							desce = false;
						}
						if ( (this.mapa.temBlocoEstatico(this.mapa.bombas[i].linha - j, this.mapa.bombas[i].coluna) == 'nao') && sobe ) {
							this.context.drawImage(this.imagem, this.posicaoDesenho(this.indices.explosaoY), 0, this.tamanhoBloco,
								this.tamanhoBloco, this.posicaoDesenho(this.mapa.bombas[i].coluna), this.posicaoDesenho(this.mapa.bombas[i].linha - j),
								this.tamanhoBloco, this.tamanhoBloco);
							if ( (this.mapa.bombas[i].coluna == this.pegaIndice(this.mapa.personagem.coluna) && 
								(this.mapa.bombas[i].linha - j) == this.pegaIndice(this.mapa.personagem.linha) ) ||
								(this.mapa.bombas[i].coluna == this.pegaIndice(this.mapa.personagem.coluna) && 
								(this.mapa.bombas[i].linha - j - 1) == this.pegaIndice(this.mapa.personagem.linha) &&
								this.mapa.personagem.linha != this.posicaoDesenho(this.pegaIndice(this.mapa.personagem.linha))) ||
								((this.mapa.bombas[i].coluna - 1 ) == this.pegaIndice(this.mapa.personagem.coluna) && 
								(this.mapa.bombas[i].linha - j) == this.pegaIndice(this.mapa.personagem.linha) &&
								this.mapa.personagem.coluna != this.posicaoDesenho(this.pegaIndice(this.mapa.personagem.coluna)))) {
								this.mapa.jogoAcabou = true;
							}
							for ( var k = 0; k < this.mapa.inimigos.length; k += 1 ) {
								if ( (this.mapa.bombas[i].coluna == this.pegaIndice(this.mapa.inimigos[k].coluna) && 
									(this.mapa.bombas[i].linha - j) == this.pegaIndice(this.mapa.inimigos[k].linha) ) ||
									(this.mapa.bombas[i].coluna == this.pegaIndice(this.mapa.inimigos[k].coluna) && 
									(this.mapa.bombas[i].linha - j - 1) == this.pegaIndice(this.mapa.inimigos[k].linha) &&
									this.mapa.inimigos[k].linha != this.posicaoDesenho(this.pegaIndice(this.mapa.inimigos[k].linha))) ||
									((this.mapa.bombas[i].coluna - 1 ) == this.pegaIndice(this.mapa.inimigos[k].coluna) && 
									(this.mapa.bombas[i].linha - j) == this.pegaIndice(this.mapa.inimigos[k].linha) &&
									this.mapa.inimigos[k].coluna != this.posicaoDesenho(this.pegaIndice(this.mapa.inimigos[k].coluna)))) {
									this.mapa.explodeInimigos(k);
								}
							}
						} else {
							sobe = false;
						}
					}
				}
				if ( this.mapa.inimigos.length == 0 ) {
					this.mapa.jogoAcabou = true;
					this.mapa.jogadorVenceu = true;
				}
				this.mapa.explodeBomba(i);
			} else {
				this.context.drawImage(this.imagem, this.posicaoDesenho(this.indices.bomba), 0, this.tamanhoBloco,
					this.tamanhoBloco, this.posicaoDesenho(this.mapa.bombas[i].coluna), this.posicaoDesenho(this.mapa.bombas[i].linha),
					this.tamanhoBloco, this.tamanhoBloco);
				this.mapa.bombas[i].tempo -= 1;
			}
		}
	},
	//processa premio se existir
	processaPremio: function(linhaDestino, colunaDestino) {
		var premio = this.mapa.temPremio(linhaDestino, colunaDestino);
		if ( premio != 'nao' ) {
			switch (premio) {
				case 0:
					this.numBombas += 1
					break;
				case 1:
					this.forca += 1
					break;
				case 2:
					this.velocidade += 1
					break;
			}
		}
	}
}