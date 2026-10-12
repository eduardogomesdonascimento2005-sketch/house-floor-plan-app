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
    { id: 1, type: 'Sala', x: 90, y: 100, width: 7, height: 5, color: '#8ecae6' },
    { id: 2, type: 'Quarto', x: 315, y: 100, width: 4, height: 4, color: '#ffd166' },
    { id: 3, type: 'Cozinha', x: 90, y: 310, width: 4, height: 3, color: '#90be6d' },
    { id: 4, type: 'Banheiro', x: 315, y: 310, width: 3, height: 2.5, color: '#cdb4db' },
  ]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [gridSize, setGridSize] = useState(1);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ roomId: number; offsetX: number; offsetY: number } | null>(null);

  const selectedRoom = rooms.find((room) => room.id === selectedId) ?? rooms[0];

  const totalArea = useMemo(
    () => rooms.reduce((sum, room) => sum + room.width * room.height, 0),
    [rooms],
  );

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
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'planta-da-casa.json';
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

    const nextX = clamp(point.x - dragRef.current.offsetX, 15, 610 - room.width);
    const nextY = clamp(point.y - dragRef.current.offsetY, 15, 430 - room.height);

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
          <p className="eyebrow">Planner</p>
          <h1>Planta da Casa</h1>
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

            {rooms.map((room) => {
              const isSelected = room.id === selectedId;
              return (
                <g key={room.id}>
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.width * 30}
                    height={room.height * 30}
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
                    x={room.x + room.width * 15}
                    y={room.y + room.height * 15}
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
