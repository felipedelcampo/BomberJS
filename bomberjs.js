function randint(min, max) {
    return min + Math.floor((max - min) * Math.random());
}

function Jogador(linha, coluna) {
	this.linha = linha;
	this.coluna = coluna;
	this.sobe = false;
	this.desce = false;
	this.direita = false;
	this.esquerda = false;
}

function Bomba(linha, coluna, forca, tempo) {
	this.linha = linha;
	this.coluna = coluna;
	this.forca = forca;
	this.tempo = tempo;
}

function Bloco(linha, coluna) {
	this.linha = linha;
	this.coluna = coluna;
}

function Premio(linha, coluna, tipoPremio) {
	this.linha = linha;
	this.coluna = coluna;
	this.tipoPremio = tipoPremio; // 0 Bomba, 1 Fogo, 2 Chinelo
}

function Mapa(altura, largura) {
	this.altura = altura;
	this.largura = largura;
	this.numBlocos = this.altura * this.largura;
	this.blocosEstaticos = new Array();
	this.blocos = new Array();
	this.inimigos = new Array();
	this.premios = new Array();
	this.bombas = new Array();
	this.jogoAcabou = false;
	this.jogadorGanhou = false;
}

Mapa.prototype = {
	//Cria blocos ficos na tela
	criaBlocosEstaticos: function() {
		for ( var i = 1; i < this.altura; i += 2 ) {
			for ( var j = 1; j < this.largura; j+=2) {
				this.blocosEstaticos.push(new Bloco(i, j));
			}
		}
	},
	//Preenche Blocos
	criaBlocos: function() {
		//Linhas pares
		for ( var i = 0; i <= this.altura; i += 2 ) {
			var faltaBlocoP = parseInt(0.3 * this.largura);
			var comecaFaltaP = randint(0, (this.largura - faltaBlocoP));
			for ( var j = 0; j <= this.largura; j += 1) {
				if ((i == 0 && j == 0) || (i == 0 && j == 1) || (j >= comecaFaltaP && j <= (comecaFaltaP + faltaBlocoP))) {
					continue;
				} else {
					this.blocos.push(new Bloco(i, j));
				}
			}
		}
		//Linhas Ímpares
		for ( var i = 1; i < this.altura; i += 2) {
			var faltaBlocoI = parseInt(0.1 * this.largura);
			var comecaFaltaI = randint(0, (this.largura - faltaBlocoI));
			for ( var j = 0; j <= this.largura; j += 2) {
				if ((j >= comecaFaltaI && j <= (comecaFaltaI + faltaBlocoI)) || (i==1 && j==0)) {
					continue;
				} else {
					this.blocos.push(new Bloco(i, j));
				}
			}
		}
	},
	//Verifica se existe bloco na posição e retorna o indice
	temBloco: function (linha, coluna) {
		for ( var i = 0; i < this.blocos.length; i += 1) {
			if (this.blocos[i].linha == linha && this.blocos[i].coluna == coluna) {
				return i;
			}
		}
		return 'nao';	
	},
	//Verifica se existe bloco Estático na posição e retorna o indice
	temBlocoEstatico: function (linha, coluna) {
		for ( var i = 0; i < this.blocosEstaticos.length; i += 1) {
			if (this.blocosEstaticos[i].linha == linha && this.blocosEstaticos[i].coluna == coluna) {
				return i;
			}
		}
		return 'nao';
	},
	//Verifica se existe uma Bomba em uma posição
	temBomba: function (linha, coluna) {
		for ( var i = 0; i < this.bombas.length; i += 1) {
			if (this.bombas[i].linha == linha && this.bombas[i].coluna == coluna) {
				return i;
			}
		}
		return 'nao';
	},
	//Verifica se existe um prêmio em uma posição se existir retorna o tipo
	temPremio: function (linha, coluna) {
		for ( var i = 0; i < this.premios.length; i += 1) {
			if (this.premios[i].linha == linha && this.premios[i].coluna == coluna) {
				var premio = this.premios[i].tipoPremio;
				this.premios.splice(i, 1);
				return premio;
			}
		}
		return 'nao';
	},
	//Cria inimigos em espaços válidos
	criaInimigos: function(inimigos) {
		var inimigosRestantes = inimigos;
		while ( inimigosRestantes > 0) {
			var linha = randint(3, this.altura);
			var coluna = randint(3, this.largura);
			if (this.temBloco(linha, coluna) == 'nao' && this.temBlocoEstatico(linha, coluna) == 'nao') {
				this.inimigos.push(new Jogador(linha, coluna));
				inimigosRestantes -= 1;
			}
		}
	},
	//Cria Pesonagem
	criaPersonagem: function() {
		this.personagem = new Jogador(0, 0);
	},
	//Cria os 3 Premios em blocos existentes
	criaPremios: function() {
		var premiosRestantes = 3;
		while ( premiosRestantes > 0 ) {
			var linha = randint(0, this.altura);
			var coluna = randint(0, this.largura);
			if (this.temBloco(linha, coluna)  != 'nao') {
				var tipoPremio = randint(0, 3);
				this.premios.push(new Premio(linha, coluna, tipoPremio));
				premiosRestantes -= 1;
			}
		}
	},
	//Cria uma bomba
	criaBomba: function (linha, coluna, forca) {
		this.bombas.push(new Bomba(linha, coluna, forca, 50));
	},
	//Explode os Blocos das bombas
	explodeBombaBloco: function (indice) {
		var direita = true;
		var esquerda = true;
		var sobe = true;
		var desce = true;
		for ( var i = 1; i <= this.bombas[indice].forca; i += 1) {
			proximoDireita = this.temBloco(this.bombas[indice].linha, this.bombas[indice].coluna + i);
			if ( proximoDireita != 'nao' && direita ) {
				this.blocos.splice(proximoDireita,1);
			} else {
				proximoDireita = this.temBlocoEstatico(this.bombas[indice].linha, this.bombas[indice].coluna + i);
				if ( proximoDireita != 'nao' ) {
					direita = false;
				}
			}
			proximoCima = this.temBloco(this.bombas[indice].linha - i, this.bombas[indice].coluna);
			if ( proximoCima != 'nao' && sobe ) {
				this.blocos.splice(proximoCima,1);
			} else {
				proximoCima = this.temBlocoEstatico(this.bombas[indice].linha - i, this.bombas[indice].coluna);
				if ( proximoCima != 'nao' ) {
					sobe = false;
				}
			}
			proximoEsquerda = this.temBloco(this.bombas[indice].linha, this.bombas[indice].coluna - i);
			if ( proximoEsquerda != 'nao' && esquerda ) {
				this.blocos.splice(proximoEsquerda,1);
			} else {
				proximoEsquerda = this.temBlocoEstatico(this.bombas[indice].linha, this.bombas[indice].coluna - i);
				if ( proximoEsquerda != 'nao' ) {
					esquerda = false;
				}
			}
			proximoBaixo = this.temBloco(this.bombas[indice].linha + i, this.bombas[indice].coluna);
			if ( proximoBaixo != 'nao' && desce) {
				this.blocos.splice(proximoBaixo,1);
			} else {
				proximoBaixo = this.temBlocoEstatico(this.bombas[indice].linha + i, this.bombas[indice].coluna);
				if ( proximoBaixo != 'nao' ) {
					desce = false;
				}
			}
		}
	},
	// Explode a bomba e os inimigos
	explodeInimigos: function (indice) {
		this.inimigos.splice(indice,1);
	},
	// Explode a Bomba
	explodeBomba: function (indice) {
		this.bombas.splice(indice,1);
	}
}
