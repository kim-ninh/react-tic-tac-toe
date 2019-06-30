

function Square(props) {
    let className = 'square';
    if (props.isHighlight)
        className = 'square win';
    return (
        <button className={className} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, isHighlight) {
        return (
            <Square
                isHighlight={isHighlight}
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        let side = this.props.side;
        let rows = [];
        for (let i = 0; i < side; i++) {
            let cells = [];
            for (let j = 0; j < side; j++) {
                let isHighlight = false;
                if (this.props.winnerPos) {
                    this.props.winnerPos.forEach(index => {
                        if (index === side * i + j)
                            isHighlight = true;
                    });
                }
                cells.push(this.renderSquare(side * i + j, isHighlight));
            }
            rows.push(
                <div key={i} className="board-row">
                    {cells}
                </div>);
        }
        return (<div>{rows}</div>);
    }
}

class HistoryMove extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDesc: false,
        };
        this.handleSort.bind(this);
    }

    render() {
        let history = this.props.history;
        const currentStepNumber = this.props.stepNumber;

        history.sort((a, b) => {
            return a.stepNumber - b.stepNumber;
        })

        if ((this.state.isDesc && history[0].stepNumber === 0) ||
            (!this.state.isDesc && history[history.length - 1].stepNumber === 0)) {
            history.reverse();
        }


        const moves = history.map((step, move) => {
            const location = step.location;
            const stepNum = step.stepNumber;
            const desc = stepNum
                ? `Go to move #${stepNum} (${location.col}, ${location.row})`
                : 'Go to game start';

            let buttonClass = '';
            if (currentStepNumber === stepNum) {
                buttonClass = 'font-weight-bold';
            }

            return (
                <li key={stepNum} className="mb-3">
                    <button
                        className={buttonClass}
                        onClick={() => this.props.onClick(stepNum)}>
                        {desc}
                    </button>
                </li>
            );
        });


        let listMoves;
        if (this.state.isDesc) {
            listMoves = <ol reversed>{moves}</ol>;
        } else {
            listMoves = <ol>{moves}</ol>;
        }

        return (
            <div className="my-3">
                <button onClick={() => this.handleSort()} className="mb-3">Sort</button>
                {listMoves}
            </div>
        );
    }

    handleSort() {

        this.setState(state => {
            return {
                isDesc: !state.isDesc,
            }
        });

    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.boardSide = 3;
        this.state = {
            history: [
                {
                    squares: Array(this.boardSide ^ 2).fill(null),
                    location: {
                        col: null,
                        row: null
                    },
                    stepNumber: 0,
                }
            ],
            xIsNext: true,
            stepNumber: 0
        };
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const stepNumber = this.state.stepNumber;

        let status;
        let winnerPos = null;
        if (winner !== null) {
            status = 'Winner: ' + winner.winner;
            winnerPos = winner.pos;
        } else {
            if (!isFull(current.squares)) {
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            } else {
                status = 'Draw';
            }
        }

        return (
            <div className="game">
                <div className="game-board mt-3 mx-3">
                    <Board
                        winnerPos={winnerPos}
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                        side={this.boardSide} />
                </div>
                <div className="game-info mt-3">
                    <div>{status}</div>
                    <HistoryMove
                        stepNumber={stepNumber}
                        history={history}
                        onClick={move => this.jumpTo(move)} />
                </div>
            </div>
        );
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const currentStep = this.state.stepNumber;
        let current;

        history.forEach(move => {
            if (move.stepNumber === currentStep) {
                current = move;
            }
        });

        const squares = current.squares.slice();
        const side = this.boardSide;

        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([
                {
                    squares: squares,
                    location: {
                        col: Math.floor(i / side),
                        row: i % side
                    },
                    stepNumber: currentStep + 1,
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: step % 2 === 0
        });
    }
}
// ========================================

ReactDOM.render(<Game />, document.getElementById('root'));

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                pos: [a, b, c],
            }
        }
    }
    return null;
}


function isFull(squares) {
    for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
            return false;
        }
    }
    return true;
}