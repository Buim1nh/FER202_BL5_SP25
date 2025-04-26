import { useState, useEffect } from "react";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";
import Footer from "../../components/Footer";
import { useRegion } from "../../context/RegionContext"; // ✅

export default function AddressPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSelectMode =
    new URLSearchParams(location.search).get("selectMode") === "true";
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const { country: currentCountry } = useRegion(); // ✅ lấy vùng hiện tại

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    zipcode: "",
    country: null,
    state: null,
    city: null,
  });

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAddresses = async () => {
    const res = await axios.get(
      `http://localhost:9999/address?userId=${currentUser?.id}`
    );
    setAddresses(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.country?.name !== currentCountry) {
      alert(`Please select an address within "${currentCountry}"`);
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      country: formData.country?.name,
      state: formData.state?.name,
      city: formData.city?.name,
      userId: currentUser?.id,
    };

    await axios.post("http://localhost:9999/address", payload);
    setFormData({
      fullName: "",
      phone: "",
      street: "",
      zipcode: "",
      country: null,
      state: null,
      city: null,
    });
    fetchAddresses();
    setLoading(false);
  };

  const countryOptions = Country.getAllCountries().map((c) => ({
    label: c.name,
    value: c.isoCode,
    name: c.name,
  }));

  const stateOptions = formData.country
    ? State.getStatesOfCountry(formData.country.value).map((s) => ({
        label: s.name,
        value: s.isoCode,
        name: s.name,
      }))
    : [];

  const cityOptions = formData.state
    ? City.getCitiesOfState(formData.country.value, formData.state.value).map(
        (c) => ({
          label: c.name,
          value: c.name,
          name: c.name,
        })
      )
    : [];

  useEffect(() => {
    fetchAddresses();
  }, []);

  const filteredAddresses = addresses.filter(
    (addr) => addr.country === currentCountry
  ); // ✅ chỉ hiển thị địa chỉ của vùng đang chọn

  return (
    <div>
      <TopMenu />
      <MainHeader />
      <SubMenu />
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-4">Add New Address</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="border p-2 rounded"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            className="border p-2 rounded"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />
          <input
            type="text"
            name="street"
            placeholder="Street Address"
            className="border p-2 rounded col-span-2"
            value={formData.street}
            onChange={(e) =>
              setFormData({ ...formData, street: e.target.value })
            }
            required
          />
          <input
            type="text"
            name="zipcode"
            placeholder="Zip Code"
            className="border p-2 rounded"
            value={formData.zipcode}
            onChange={(e) =>
              setFormData({ ...formData, zipcode: e.target.value })
            }
            required
          />
          <Select
            className="col-span-2"
            value={{
              label: currentCountry,
              value: Country.getAllCountries().find(
                (c) => c.name === currentCountry
              )?.isoCode,
              name: currentCountry,
            }}
            isDisabled={true}
          />

          <Select
            placeholder="Select State/Province"
            options={stateOptions}
            value={formData.state}
            onChange={(val) =>
              setFormData({ ...formData, state: val, city: null })
            }
          />
          <Select
            placeholder="Select City"
            options={cityOptions}
            value={formData.city}
            onChange={(val) => setFormData({ ...formData, city: val })}
          />
          <button
            type="submit"
            className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Address"}
          </button>
        </form>

        <h2 className="text-xl font-bold mt-8 mb-4">Saved Addresses</h2>
        {filteredAddresses.length === 0 ? (
          <p className="text-gray-500">
            No address found for <strong>{currentCountry}</strong>.
          </p>
        ) : (
          filteredAddresses.map((addr) => (
            <div
              key={addr.id}
              className="p-4 border rounded-lg mb-4 shadow-sm bg-gray-50"
            >
              <div className="font-semibold">
                {addr.fullName} - {addr.phone}
              </div>
              <div className="text-sm">
                {addr.street}, {addr.city}, {addr.state}, {addr.country},{" "}
                {addr.zipcode}
              </div>

              {isSelectMode && (
                <button
                  onClick={() => {
                    localStorage.setItem(
                      "selectedAddress",
                      JSON.stringify(addr)
                    );
                    navigate("/checkout");
                  }}
                  className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Select this address
                </button>
              )}
            </div>
          ))
        )}
      </div>
      <Footer />
    </div>
  );
}
