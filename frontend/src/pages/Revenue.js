import React from 'react';
import Navbar from '../components/Navbar';
function Revenue() {

  return (
<>
  <Navbar />
    <div className="min-h-screen bg-slate-900 text-white p-10">

      <h1 className="text-5xl font-bold mb-10">

        Revenue Dashboard

      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div className="bg-slate-800 p-8 rounded-2xl">

          <h2 className="text-3xl font-bold">

            Total Revenue

          </h2>

          <p className="text-4xl text-green-400 mt-4">

            ₹45,000

          </p>

        </div>

        <div className="bg-slate-800 p-8 rounded-2xl">

          <h2 className="text-3xl font-bold">

            Tickets Sold

          </h2>

          <p className="text-4xl text-blue-400 mt-4">

            320

          </p>

        </div>

        <div className="bg-slate-800 p-8 rounded-2xl">

          <h2 className="text-3xl font-bold">

            Occupancy

          </h2>

          <p className="text-4xl text-yellow-400 mt-4">

            87%

          </p>

        </div>

      </div>

    </div>
</>
  );

}

export default Revenue;