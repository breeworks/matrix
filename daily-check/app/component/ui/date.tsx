export default function date(date: number) {
  return (
    <div>
      <div className = " p-5 m-2 w-20 h-20 border-2 rounded-4xl cursor-pointer hover:bg-gray-200 font-mono flex justify-center align-middle text-center text-3xl">
        <div className="gird grid-cols-7 " >
        <span>{date}</span>
        </div>
        </div>
      </div>
  );
}
