import axios from "axios";

export const initiateKhaltiPayment = async (req, res) => {
  try {
    const {
      amount,
      return_url,
      website_url,
      purchase_order_id,
      purchase_order_name,
      customer_info,
    } = req.body;

    const khaltiRes = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      {
        amount,
        return_url,
        website_url,
        purchase_order_id,
        purchase_order_name,
        customer_info,
      },
      {
        headers: {
          Authorization: "Key 0ff6f5f011f1480b9239dc0fa6aec717", 
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(khaltiRes.data); 
  } catch (error) {
    console.error("Khalti payment init error:", error.response?.data || error);
    res.status(500).json({ error: "Failed to initiate Khalti payment" });
  }
};
