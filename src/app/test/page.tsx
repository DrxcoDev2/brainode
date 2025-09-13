export default async function Test() {
    const res = await fetch("http://localhost:2000/users", { cache: "no-store" });
    const users = await res.json();
  
    return (
      <div>
        <h1>Usuarios</h1>
        <ul>
          {users.map((u: any) => (
            <li key={u.id}>{u.name} - {u.email}</li>
          ))}
        </ul>
      </div>
    );
  }
  