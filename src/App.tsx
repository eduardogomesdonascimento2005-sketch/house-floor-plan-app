import { useMemo, useRef, useState } from 'react';

type RoomType =
  | 'Sala'
  | 'Quarto'
  | 'Cozinha'
  | 'Banheiro'
  | 'Hall'
  | 'Garagem'
  | 'Escritório';

type Room = {
  id: number;
  type: RoomType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

const ROOM_TYPES: RoomType[] = ['Sala', 'Quarto', 'Cozinha', 'Banheiro', 'Hall', 'Garagem', 'Escritório'];

const ROOM_PRESETS: Record<RoomType, { width: number; height: number; color: string }> = {
  Sala: { width: 6, height: 5, color: '#8ecae6' },
  Quarto: { width: 4, height: 4, color: '#ffd166' },
  Cozinha: { width: 4, height: 3, color: '#90be6d' },
  Banheiro: { width: 3, height: 2.5, color: '#cdb4db' },
  Hall: { width: 3, height: 2, color: '#f4a261' },
  Garagem: { width: 5, height: 4, color: '#adb5bd' },
  Escritório: { width: 4, height: 3.5, color: '#ffb3c1' },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const formatArea = (value: number) => `${value.toFixed(1)} m²`;

const createRoom = (type: RoomType, id: number): Room => ({
  id,
  type,
  x: 50 + (id % 5) * 18,
  y: 50 + (id % 3) * 16,
  width: ROOM_PRESETS[type].width,
  height: ROOM_PRESETS[type].height,
  color: ROOM_PRESETS[type].color,
});

function App() {
  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, type: 'Sala', x: 90, y: 110, width: 7, height: 5, color: '#8ecae6' },
    { id: 2, type: 'Quarto', x: 315, y: 110, width: 4, height: 4, color: '#ffd166' },
    { id: 3, type: 'Cozinha', x: 90, y: 320, width: 4, height: 3, color: '#90be6d' },
    { id: 4, type: 'Banheiro', x: 315, y: 320, width: 3, height: 2.5, color: '#cdb4db' },
  ]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [gridSize, setGridSize] = useState(1);
  const [showWalls, setShowWalls] = useState(true);
  const [wallThickness, setWallThickness] = useState(2.5);
  const [smartLayout, setSmartLayout] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ roomId: number; offsetX: number; offsetY: number } | null>(null);

  const selectedRoom = rooms.find((room) => room.id === selectedId) ?? rooms[0];

  const totalArea = useMemo(
    () => rooms.reduce((sum, room) => sum + room.width * room.height, 0),
    [rooms],
  );

  const planBounds = useMemo(() => {
    if (rooms.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const minX = Math.min(...rooms.map((room) => room.x));
    const minY = Math.min(...rooms.map((room) => room.y));
    const maxX = Math.max(...rooms.map((room) => room.x + room.width * 30));
    const maxY = Math.max(...rooms.map((room) => room.y + room.height * 30));

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }, [rooms]);

  const addRoom = (type: RoomType) => {
    const newId = Date.now() + Math.random();
    setRooms((current) => [...current, createRoom(type, newId)]);
    setSelectedId(newId);
  };

  const updateRoom = (roomId: number, partial: Partial<Room>) => {
    setRooms((current) =>
      current.map((room) => (room.id === roomId ? { ...room, ...partial } : room)),
    );
  };

  const removeSelectedRoom = () => {
    if (!selectedRoom || rooms.length === 1) return;
    setRooms((current) => current.filter((room) => room.id !== selectedRoom.id));
    setSelectedId(rooms.find((room) => room.id !== selectedRoom.id)?.id ?? 0);
  };

  const exportPlan = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      rooms,
      totalArea,
      walls: {
        enabled: showWalls,
        thickness: wallThickness,
        smartLayout,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'planta-da-casa-smart.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSvgPoint = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    const x = ((event.clientX - rect.left) / rect.width) * 650;
    const y = ((event.clientY - rect.top) / rect.height) * 500;

    return { x, y };
  };

  const handlePointerDown = (event: React.PointerEvent<SVGRectElement>, room: Room) => {
    event.stopPropagation();
    setSelectedId(room.id);

    const point = getSvgPoint(event as unknown as React.PointerEvent<SVGSVGElement>);
    dragRef.current = {
      roomId: room.id,
      offsetX: point.x - room.x,
      offsetY: point.y - room.y,
    };
  };

  const handleBoardPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;

    const point = getSvgPoint(event);
    const room = rooms.find((item) => item.id === dragRef.current?.roomId);
    if (!room) return;

    const nextX = clamp(point.x - dragRef.current.offsetX, 15, 610 - room.width * 30);
    const nextY = clamp(point.y - dragRef.current.offsetY, 15, 430 - room.height * 30);

    updateRoom(room.id, {
      x: nextX,
      y: nextY,
    });
  };

  const handleBoardPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">Smart Planner</p>
          <h1>Planta Inteligente</h1>
        </div>

        <section className="panel">
          <h2>Adicionar cômodo</h2>
          <div className="room-buttons">
            {ROOM_TYPES.map((type) => (
              <button key={type} className="pill" onClick={() => addRoom(type)}>
                + {type}
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Configuração</h2>

          <label className="toggle-row">
            <span>Mostrar paredes</span>
            <input type="checkbox" checked={showWalls} onChange={() => setShowWalls((value) => !value)} />
          </label>

          <label className="toggle-row">
            <span>Layout inteligente</span>
            <input type="checkbox" checked={smartLayout} onChange={() => setSmartLayout((value) => !value)} />
          </label>

          <label>
            Tamanho da grade
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={gridSize}
              onChange={(event) => setGridSize(Number(event.target.value))}
            />
          </label>

          <label>
            Espessura da parede
            <input
              type="range"
              min="1"
              max="6"
              step="0.5"
              value={wallThickness}
              onChange={(event) => setWallThickness(Number(event.target.value))}
            />
          </label>

          {selectedRoom && (
            <div className="room-editor">
              <div className="label-row">
                <span>{selectedRoom.type}</span>
                <button className="danger" onClick={removeSelectedRoom}>Remover</button>
              </div>

              <label>
                Largura (m)
                <input
                  type="number"
                  min="1"
                  max="20"
                  step="0.5"
                  value={selectedRoom.width}
                  onChange={(event) =>
                    updateRoom(selectedRoom.id, {
                      width: Number(event.target.value),
                    })
                  }
                />
              </label>

              <label>
                Altura (m)
                <input
                  type="number"
                  min="1"
                  max="20"
                  step="0.5"
                  value={selectedRoom.height}
                  onChange={(event) =>
                    updateRoom(selectedRoom.id, {
                      height: Number(event.target.value),
                    })
                  }
                />
              </label>

              <label>
                Pos. X
                <input
                  type="number"
                  min="0"
                  max="610"
                  value={selectedRoom.x}
                  onChange={(event) => updateRoom(selectedRoom.id, { x: Number(event.target.value) })}
                />
              </label>

              <label>
                Pos. Y
                <input
                  type="number"
                  min="0"
                  max="430"
                  value={selectedRoom.y}
                  onChange={(event) => updateRoom(selectedRoom.id, { y: Number(event.target.value) })}
                />
              </label>

              <div className="stats-box">
                <strong>Área:</strong>
                <span>{formatArea(selectedRoom.width * selectedRoom.height)}</span>
              </div>
            </div>
          )}
        </section>
      </aside>

      <main className="workspace">
        <header className="toolbar">
          <div>
            <p className="eyebrow dark">Resumo</p>
            <h2>{rooms.length} cômodos</h2>
          </div>
          <div className="metrics">
            <div>
              <span>Área total</span>
              <strong>{formatArea(totalArea)}</strong>
            </div>
          </div>
          <button className="primary" onClick={exportPlan}>
            Exportar projeto
          </button>
        </header>

        <div className="canvas-wrap">
          <svg
            ref={svgRef}
            className="canvas"
            viewBox="0 0 650 500"
            onPointerMove={handleBoardPointerMove}
            onPointerUp={handleBoardPointerUp}
            onPointerLeave={handleBoardPointerUp}
          >
            {Array.from({ length: 22 }).map((_, index) => (
              <line
                key={`v-${index}`}
                x1={index * 30}
                y1={0}
                x2={index * 30}
                y2={500}
                stroke="rgba(18, 58, 96, 0.08)"
                strokeWidth={gridSize}
              />
            ))}
            {Array.from({ length: 16 }).map((_, index) => (
              <line
                key={`h-${index}`}
                x1={0}
                y1={index * 30}
                x2={650}
                y2={index * 30}
                stroke="rgba(18, 58, 96, 0.08)"
                strokeWidth={gridSize}
              />
            ))}

            {showWalls && (
              <>
                <rect
                  x={planBounds.x - 8}
                  y={planBounds.y - 8}
                  width={planBounds.width + 16}
                  height={planBounds.height + 16}
                  fill="none"
                  stroke="#123a60"
                  strokeWidth={wallThickness}
                  strokeDasharray={smartLayout ? '10 10' : '0'}
                  rx={12}
                  opacity={0.82}
                />

                {rooms.map((room) => (
                  <rect
                    key={`wall-${room.id}`}
                    x={room.x - 3}
                    y={room.y - 3}
                    width={room.width * 30 + 6}
                    height={room.height * 30 + 6}
                    fill="none"
                    stroke="#234d7a"
                    strokeWidth={wallThickness}
                    rx={10}
                    opacity={0.7}
                  />
                ))}
              </>
            )}

            {rooms.map((room) => {
              const isSelected = room.id === selectedId;
              const roomWidth = room.width * 30;
              const roomHeight = room.height * 30;
              return (
                <g key={room.id}>
                  <rect
                    x={room.x}
                    y={room.y}
                    width={roomWidth}
                    height={roomHeight}
                    fill={room.color}
                    opacity={isSelected ? 1 : 0.8}
                    stroke={isSelected ? '#123a60' : '#1a1a1a'}
                    strokeWidth={isSelected ? 3 : 1.5}
                    rx={10}
                    style={{ cursor: 'move' }}
                    onPointerDown={(event) => handlePointerDown(event, room)}
                    onClick={() => setSelectedId(room.id)}
                  />
                  <text
                    x={room.x + roomWidth / 2}
                    y={room.y + roomHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="13"
                    fill="#123a60"
                    fontWeight={700}
                  >
                    {room.type}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </main>
    </div>
  );
}

export default App;
