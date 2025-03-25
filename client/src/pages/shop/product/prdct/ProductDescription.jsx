

import { useState } from "react"

const ProductDescription = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description")

  return (
    <div className="mt-16 border-t pt-8">
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "description" ? "text-[#114639] border-b-2 border-[#114639]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("description")}
        >
          Description
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "details" ? "text-[#114639] border-b-2 border-[#114639]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>
      </div>

      <div className="py-6">
        {activeTab === "description" && (
          <div>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
            {/* <p className="text-gray-700 leading-relaxed mt-4">
              Our El Salvador coffee beans are sourced from high-altitude farms in the mountainous regions of El
              Salvador. These beans are carefully selected and roasted to perfection to bring out their unique flavor
              profile.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              The beans are finely ground to ensure optimal extraction, resulting in a rich and aromatic cup of coffee
              with notes of chocolate, caramel, and a subtle citrus finish.
            </p> */}
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-[#114639]">Origin</h3>
                <p className="text-gray-700">El Salvador, Central America</p>
              </div>
              <div>
                <h3 className="font-medium text-[#114639]">Roast Level</h3>
                <p className="text-gray-700">Medium</p>
              </div>
              <div>
                <h3 className="font-medium text-[#114639]">Flavor Notes</h3>
                <p className="text-gray-700">Chocolate, Caramel, Citrus</p>
              </div>
              <div>
                <h3 className="font-medium text-[#114639]">Processing Method</h3>
                <p className="text-gray-700">Washed</p>
              </div>
              <div>
                <h3 className="font-medium text-[#114639]">Altitude</h3>
                <p className="text-gray-700">1,200 - 1,500 meters</p>
              </div>
              <div>
                <h3 className="font-medium text-[#114639]">Variety</h3>
                <p className="text-gray-700">Bourbon, Pacas</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDescription

