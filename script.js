document.addEventListener('DOMContentLoaded', () => {
    const game = document.getElementById('game');
    const player = document.getElementById('player');
    const scoreboard = document.getElementById('scoreboard');

    let playerSpeed = 5;
    let bulletSpeed = 10;
    let initialSpawnRate = 2000; // Initial spawn rate in milliseconds
    let enemySpeed = 2;
    let kills = 0;
    let gameOver = false;
    let spawnInterval;

    let keys = {};

    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    function movePlayer() {
        if (keys['ArrowUp'] && player.offsetTop > 0) {
            player.style.top = player.offsetTop - playerSpeed + 'px';
        }
        if (keys['ArrowDown'] && player.offsetTop < game.clientHeight - player.clientHeight) {
            player.style.top = player.offsetTop + playerSpeed + 'px';
        }
        if (keys['ArrowLeft'] && player.offsetLeft > 0) {
            player.style.left = player.offsetLeft - playerSpeed + 'px';
        }
        if (keys['ArrowRight'] && player.offsetLeft < game.clientWidth - player.clientWidth) {
            player.style.left = player.offsetLeft + playerSpeed + 'px';
        }
    }

    function shoot(event) {
        if (gameOver) return;

        const bullet = document.createElement('div');
        bullet.classList.add('bullet');
        bullet.style.left = player.offsetLeft + player.clientWidth / 2 - 5 + 'px';
        bullet.style.top = player.offsetTop + 'px';
        game.appendChild(bullet);

        const targetX = event.clientX - game.offsetLeft;
        const targetY = event.clientY - game.offsetTop;

        const angle = Math.atan2(targetY - bullet.offsetTop, targetX - bullet.offsetLeft);
        const velocityX = bulletSpeed * Math.cos(angle);
        const velocityY = bulletSpeed * Math.sin(angle);

        const moveBullet = setInterval(() => {
            bullet.style.left = bullet.offsetLeft + velocityX + 'px';
            bullet.style.top = bullet.offsetTop + velocityY + 'px';

            if (bullet.offsetLeft < 0 || bullet.offsetLeft > game.clientWidth ||
                bullet.offsetTop < 0 || bullet.offsetTop > game.clientHeight) {
                bullet.remove();
                clearInterval(moveBullet);
            }

            // Check for collisions with enemies
            const enemies = document.querySelectorAll('.enemy');
            enemies.forEach(enemy => {
                if (isColliding(bullet, enemy)) {
                    bullet.remove();
                    enemy.remove();
                    clearInterval(moveBullet);
                    kills++;
                    updateScoreboard();
                    updateSpawnRate();
                }
            });
        }, 20);
    }

    function spawnEnemy() {
        if (gameOver) return;

        const enemy = document.createElement('div');
        enemy.classList.add('enemy');
        enemy.style.left = Math.random() * (game.clientWidth - 40) + 'px';
        enemy.style.top = '0px';
        game.appendChild(enemy);

        const moveEnemy = setInterval(() => {
            const angle = Math.atan2(player.offsetTop - enemy.offsetTop, player.offsetLeft - enemy.offsetLeft);
            const velocityX = enemySpeed * Math.cos(angle);
            const velocityY = enemySpeed * Math.sin(angle);

            enemy.style.left = enemy.offsetLeft + velocityX + 'px';
            enemy.style.top = enemy.offsetTop + velocityY + 'px';

            if (enemy.offsetTop > game.clientHeight || enemy.offsetLeft > game.clientWidth ||
                enemy.offsetTop < 0 || enemy.offsetLeft < 0) {
                enemy.remove();
                clearInterval(moveEnemy);
            }

            // Check for collisions with player
            if (isColliding(player, enemy)) {
                endGame();
            }
        }, 20);
    }

    function isColliding(rect1, rect2) {
        const r1 = rect1.getBoundingClientRect();
        const r2 = rect2.getBoundingClientRect();

        return !(r1.right < r2.left || 
                 r1.left > r2.right || 
                 r1.bottom < r2.top || 
                 r1.top > r2.bottom);
    }

    function endGame() {
        gameOver = true;
        alert('Game Over');
        location.reload();
    }

    function updateScoreboard() {
        scoreboard.textContent = `Kills: ${kills}`;
    }

    function updateSpawnRate() {
        clearInterval(spawnInterval);
        const newSpawnRate = Math.max(500, initialSpawnRate - kills * 100);
        spawnInterval = setInterval(spawnEnemy, newSpawnRate);
    }

    document.addEventListener('click', shoot);

    function gameLoop() {
        if (!gameOver) {
            movePlayer();
            requestAnimationFrame(gameLoop);
        }
    }

    spawnInterval = setInterval(spawnEnemy, initialSpawnRate);
    gameLoop();
});
