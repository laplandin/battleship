const battlefield = [[1, 0, 0, 0, 0, 1, 1, 0, 0, 0],
                     [1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
                     [1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
                     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                     [0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
                     [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                     [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

class Ship {
    constructor({ start, direction, length }) {
        this.direction = direction;
        this.start = start;
        this.length = length;
    }
    
    get end() {
        const end = Object.assign({}, this.start);
        return {
            ...end,
            [this.direction] : end[this.direction] += this.length - 1,
        };
    }
    
}

function checkField(field) {
    const shipLimits = [null, 4, 3, 2, 1];
    const checkedMap = {};
    try {
    
        function _scan({x, y}) {
        
            if (field[y][x]) {
                /* если в клетке кто-то есть, логируем и исследуем его подробнее */
                _logCheck({x, y});
                /* определим направление */
                const direction = _getDirection({y, x}) || 'x'; // возможно одноклеточный
                const length = _getLength({y, x}, direction);
                const ship = new Ship({
                    start: {x, y},
                    direction,
                    length
                });
            
                shipLimits[ship.length]--;
                if (shipLimits[ship.length] < 0) {
                    throw new Error(`not valid number of ${ship.length}-length ships`)
                }
            
                _getBoundingRect(ship);
            }
        
            _logCheck({x, y});
        }
    
        function _getDirection({y, x}) {
            if ( x + 1 < 10 && field[y][x + 1]) {
                return 'x';
            }
            if (y + 1 < 10 && field[y + 1][x]) {
                return 'y';
            }
            // одноклеточный
            return null;
        }
    
        function _getLength(coords, direction) {
            const start = coords[direction];
            coords[direction]++;
            
            if ( coords[direction] >= 10) {
                return 1;
            }
            
            let shipChunk = field[coords.y][coords.x];
            while (shipChunk) {
                /*edge*/
                _logCheck({y: coords.y, x: coords.x});
                coords[direction]++;
                shipChunk = field[coords.y][coords.x];
            }
			const length = coords[direction] - start;
			if (length > 4) {
				throw new Error(`invalid ship size: ${length}`);
			}
            return length;
        }
    
        function _logCheck({x, y}) {
            const key = _getKey({x, y});
            checkedMap[key] = true;
        }
    
        function _getBoundingRect(ship) {
            const {start, end, direction} = ship;
            const swappedDir = {x: 'y', y: 'x'}[direction];
        
            for (let i = start[direction] - 1; i <= end[direction] + 1; i++) {
                // окружаем судно
                _strictCheck({
                    [direction]: i,
                    [swappedDir]: start[swappedDir] - 1,
                });
                _strictCheck({
                    [direction]: i,
                    [swappedDir]: start[swappedDir] + 1,
                })
            }
            // и с концов тоже
            _strictCheck({
                [direction]: start[direction] - 1,
                [swappedDir]: start[swappedDir],
            });
            _strictCheck({
                [direction]: end[direction] + 1,
                [swappedDir]: start[swappedDir],
            });
        }
    
        function _strictCheck({x, y}) {
            if (x < 0 || x >= 10 || y < 0 || y >= 10) {
                return null;
            }
            const key = _getKey({x, y});
            if (Object.prototype.hasOwnProperty.call(checkedMap, key)) {
                return true;
            }
            if (field[y][x]) {
                _checkFail({x, y});
            }
            _logCheck({x, y});
        }
    
        function _getKey({x, y}) {
            return `${y}${x}`;
        }
    
        function _checkFail({x, y}) {
            throw new Error(`check failed at position y:${y} x:${x}`);
        }
    
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
            
                const key = _getKey({x, y});
                if (Object.prototype.hasOwnProperty.call(checkedMap, key)) {
                    /* если клетка уже проверена, идём дальше */
                    continue;
                }
                _scan({x, y});
            }
        }
    } catch (err) {
        console.error(err);
        return false;
    }
    console.log('all right');
    return true;
}

checkField(battlefield);