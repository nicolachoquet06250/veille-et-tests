function Component({message}: {message: string}) {
  return (
    <body>
      <h1 style={{color: 'red'}}>{message}</h1>
    </body>
  );
}

console.log(<Component message="Hello world!" />);
