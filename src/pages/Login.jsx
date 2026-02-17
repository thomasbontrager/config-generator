export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 rounded-xl w-96 border border-white/10" style={{ backgroundColor: '#121826' }}>
        <h2 className="text-2xl font-bold">Login</h2>
        <input className="mt-4 w-full p-2 bg-black/30 rounded" placeholder="Email" />
        <input className="mt-3 w-full p-2 bg-black/30 rounded" placeholder="Password" type="password" />
        <button className="mt-6 w-full py-2 rounded" style={{ backgroundColor: '#3b82f6' }}>Login</button>
      </div>
    </div>
  );
}
