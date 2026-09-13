const chessBoard=document.querySelector('#chess-board');
for(let row=0;row<8;row++)for(let col=0;col<8;col++){const cell=document.createElement('span');cell.className='chess-square '+((row+col)%2?'dark':'light');cell.setAttribute('aria-hidden','true');chessBoard.append(cell)}
const chessScene=document.querySelector('#chess-scene'),chessPlay=document.querySelector('#chess-play'),chessMessage=document.querySelector('#chess-message');
let chessTimers=[];
function playChess(){chessTimers.forEach(clearTimeout);chessTimers=[];chessScene.classList.remove('capture','finished');chessMessage.textContent='';chessPlay.disabled=true;const instant=matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('calm');if(instant){chessScene.classList.add('capture','finished');finishChess();return}chessTimers.push(setTimeout(()=>chessScene.classList.add('capture'),500));chessTimers.push(setTimeout(()=>{chessScene.classList.add('finished');finishChess()},2600))}
function finishChess(){chessMessage.textContent="J’ai perdu, il ne me reste que ma reine.";chessPlay.disabled=false;chessPlay.textContent='Rejouer notre petite histoire ↻'}
chessPlay.addEventListener('click',playChess);
if('IntersectionObserver'in window){const chessObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){playChess();chessObserver.disconnect()}},{threshold:.45});chessObserver.observe(chessScene)}
