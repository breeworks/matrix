import {useState} from 'react'
import { Bounce, ToastContainer } from "react-toastify";

function TextArea() {

    const [todo, settodo] = useState("");

  return (
    <div>
        <div className="mt-60 p-4 border-2 rounded-2xl h-100 ">
          <h2 className="text-xl font-bold">
            What did you do on {}?
          </h2>
          <input
            type="text"
            value={todo}
            placeholder="So what did you do today?"
            onChange={(e) => settodo(e.target.value)}
            className="border p-2 w-full mt-2 rounded-md"
          />
          <button
            className="mt-2 border-2 rounded-2xl hover:text-xl text-lg px-4 py-2"
          >
            Add to matrix
            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              transition={Bounce}
            />
          </button>
        </div>

    </div>
  )
}

export default TextArea