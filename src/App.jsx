import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const grid = 8;
  const initialBot = { x: 0, y: 0 };
  const [bot, setBot] = useState(initialBot);
  const [arm, setArm] = useState({ x: 0, y: 1 });
  const [probe, setProbe] = useState({
    x: Math.floor(Math.random() * grid),
    y: Math.floor(Math.random() * grid),
  });
  const [hasProbe, setHasProbe] = useState(false);
  const [session, setSession] = useState({
    start: null,
    keys: [],
    probeMove: null,
  });
  const [history, setHistory] = useState([]);
  const [commandInput, setCommandInput] = useState(""); 
  const [commandQueue, setCommandQueue] = useState([]); 
  const [isExecuting, setIsExecuting] = useState(false); 

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("sessions")) || [];
    setHistory(stored);
  }, []);

  useEffect(() => {
    if (isExecuting && commandQueue.length > 0) {
      const currentCommand = commandQueue[0];
      executeCommand(currentCommand);
    }
  }, [isExecuting, commandQueue]);

  const handleInput = (e) => {
    setCommandInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const commands = commandInput.toLowerCase().split(""); 
    setCommandQueue(commands);
    setCommandInput(""); 
    setIsExecuting(true); 
  };

  const executeCommand = (key) => {
    let newArm = { ...arm };
    let newBot = { ...bot };

    if (key === "w") newArm.y = Math.max(0, arm.y - 1);
    if (key === "s") newArm.y = Math.min(grid - 1, arm.y + 1);
    if (key === "a") newArm.x = Math.max(0, arm.x - 1);
    if (key === "d") newArm.x = Math.min(grid - 1, arm.x + 1);

    if (key === "k" && arm.x === probe?.x && arm.y === probe?.y && !hasProbe) {
      grabProbe();
      startSession();
    }

    if (key === "l" && hasProbe) {
      dropProbe();
      endSession();
    }

    if (session.start) {
      setSession((prev) => ({
        ...prev,
        keys: [...prev.keys, key],
      }));
    }

    setArm(newArm);
    setBot(newBot);

    setCommandQueue((prev) => prev.slice(1)); 
    if (commandQueue.length === 1) {
      setIsExecuting(false); 
    }
  };

  const grabProbe = () => {
    setHasProbe(true);
    setProbe(null);

    setSession((prev) => ({
      ...prev,
      probeMove: { from: { x: arm.x, y: arm.y }, to: null },
    }));
  };

  const dropProbe = () => {
    const lastPos = { x: arm.x, y: arm.y };
    setProbe({ x: arm.x, y: arm.y });
    setHasProbe(false);

    setSession((prev) => ({
      ...prev,
      probeMove: { from: lastPos, to: { x: arm.x, y: arm.y } },
    }));
  };

  const startSession = () => {
    setSession({
      start: new Date(),
      keys: [],
    });
  };

  const endSession = () => {
    const newSession = {
      ...session,
      end: new Date(),
    };

    setHistory((prev) => {
      const updated = [...prev, newSession];
      localStorage.setItem("sessions", JSON.stringify(updated));
      return updated;
    });

    setSession({
      start: null,
      keys: [],
    });
  };

  return (
    <div className="flex flex-row items-start p-4 gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Robotni boshqarish paneli</h1>
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${grid}, 40px)`,
            gridTemplateRows: `repeat(${grid}, 40px)`,
          }}
        >
          {Array.from({ length: grid }).map((_, row) =>
            Array.from({ length: grid }).map((_, col) => {
              const isBot = bot.x === col && bot.y === row;
              const isArm = arm.x === col && arm.y === row;
              const isProbe = probe && probe.x === col && probe.y === row;
              const isArmOnProbe = isArm && isProbe;

              return (
                <div
                  key={`${row}-${col}`}
                  className={`w-10 h-10 border flex items-center justify-center transition-all duration-200 ease-in-out ${
                    isBot
                      ? "bg-blue-800"
                      : isProbe
                      ? "bg-green-500"
                      : isArmOnProbe
                      ? "bg-green-300"
                      : isArm
                      ? "bg-blue-400"
                      : "bg-gray-200"
                  }`}
                ></div>
              );
            })
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={commandInput}
            placeholder="Harakat: w, a, s, d | Olish: k | Qo'yish: l"
            className="p-2 border rounded mt-4 w-full"
            onChange={handleInput}
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded mt-2 w-full"
          >
            Buyruqlarni bajarish
          </button>
        </form>
      </div>

      <div className="w-1/2">
        <h2 className="text-2xl font-bold mb-4">Bajarilgan ishlar:</h2>
        <div className="max-h-[500px] overflow-y-auto p-2 border rounded bg-gray-50">
          {history.map((session, index) => (
            <div key={index} className="p-4 border-b mb-2">
              <p>
                <strong>Boshlanish vaqti:</strong>{" "}
                {session.start ? new Date(session.start).toLocaleTimeString() : ""}
              </p>
              <p>
                <strong>Tugash vaqti:</strong>{" "}
                {session.end ? new Date(session.end).toLocaleTimeString() : ""}
              </p>
              <p>
                {" "}
                <strong>Bosilgan tugmalar:</strong> {session.keys.join(", ")}{" "}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
