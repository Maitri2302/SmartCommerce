import "../styles/Profile.css";

function Profile() {
  const orders = [
    {
      id: "SC10231",
      product: "Sony WH-1000XM5",
      status: "Delivered",
      price: 24999,
    },
    {
      id: "SC10232",
      product: "Apple Watch Series 9",
      status: "Shipped",
      price: 39999,
    },
    {
      id: "SC10233",
      product: "Mechanical Keyboard",
      status: "Processing",
      price: 5999,
    },
  ];

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>👤 My Profile</h1>

        <p>
          <strong>Name:</strong> Maitri
        </p>
        <p>
          <strong>Email:</strong> maitri@example.com
        </p>
        <p>
          <strong>Member Since:</strong> 2026
        </p>
      </div>

      <div className="orders-card">
        <h2>📦 My Orders</h2>

        {orders.map((order) => (
          <div className="order-item" key={order.id}>
            <div>
              <h3>{order.product}</h3>
              <p>Order ID: {order.id}</p>
            </div>

            <div>
              <p>{order.status}</p>
              <h3>₹{order.price}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="address-card">
        <h2>📍 Saved Address</h2>

        <p>
          123 ABC Street
          <br />
          New Delhi
          <br />
          India
        </p>
      </div>

      <div className="account-card">
        <h2>⚙️ Account</h2>

        <button>Edit Profile</button>

        <button>Change Password</button>

        <button className="logout">Logout</button>
      </div>
    </div>
  );
}

export default Profile;
