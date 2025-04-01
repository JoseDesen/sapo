let startX, startY;

		const gameArea = document.getElementById('gameArea');
		alert(gameArea);
		gameArea.addEventListener('touchstart', function(event) {
			const touch = event.touches[0];
			startX = touch.clientX;
			startY = touch.clientY;
		}, false);

		gameArea.addEventListener('touchmove', function(event) {
			event.preventDefault(); // Evita o scroll da página
		}, false);

		gameArea.addEventListener('touchend', function(event) {
			const touch = event.changedTouches[0];
			const endX = touch.clientX;
			const endY = touch.clientY;

			const diffX = endX - startX;
			const diffY = endY - startY;

			if (Math.abs(diffX) > Math.abs(diffY)) {
				// Movimento horizontal
				if (diffX > 0) {
					// Swipe para a direita
					direcao(3);
				} else {
					// Swipe para a esquerda
					direcao(1);
				}
			} else {
				// Movimento vertical
				if (diffY < 0) {
					// Swipe para cima
					direcao(2);
				} else {
					// Swipe para baixo
				}
			}
		}, false);
