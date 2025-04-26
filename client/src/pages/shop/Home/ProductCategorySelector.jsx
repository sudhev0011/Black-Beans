  import { BeansIcon, EquipmentsIcon } from '@/assets/category';

const Category = ({ icon, label, isActive, onClick }) => (
  <div
    className={`flex flex-col items-center hover:text-[#114639] transition-all duration-300 ease-in-out cursor-pointer ${
      isActive ? 'text-[#114639]' : 'text-gray-600'
    }`}
    onClick={onClick}
  >
    <div className="w-16 h-16 flex items-center justify-center">
      <img src={icon} alt={label} />
    </div>
    <span className="text-xs font-bold tracking-wider">{label}</span>
  </div>
);

export function ProductCategorySelector({ activeCategory, onCategoryChange, categories }) {
  const staticCategories = [
    { icon: BeansIcon, label: 'COFFEE BEANS', value: 'coffee-beans' },
    { icon: EquipmentsIcon, label: 'EQUIPMENTS', value: 'equipments' },
  ];
  
  const dynamicCategories = categories?.map((cat) => ({
    icon: cat.name.toLowerCase().includes('coffee') ? BeansIcon : EquipmentsIcon,
    label: cat.name.toUpperCase(),
    value: cat._id,
  })) || staticCategories;

  return (
    <div className="our-categorys flex justify-center gap-12 mb-16">
      {dynamicCategories?.map((category) => (
        <Category
          key={category.value}
          icon={category.icon}
          label={category.label}
          isActive={activeCategory === category.value}
          onClick={() => onCategoryChange(category.value)}
        />
      ))}
    </div>
  );
}