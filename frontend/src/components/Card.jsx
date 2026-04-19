const Card = ({ title, value }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-gray-500">{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default Card;