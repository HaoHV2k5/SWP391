import React from "react";
import { Card } from "react-bootstrap";
import { useSavedProducts } from "../contexts/SavedProductsContext";

const SavedPopup = () => {
    const { savedProducts } = useSavedProducts();
    return (
        <Card
            className="shadow"
            style={{
                width: "400px",
                borderRadius: "10px",
                overflow: "hidden"
            }}
        >
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Tin đăng đã lưu</strong>
                    <a href="/saved-posts" className="text-primary text-decoration-none small">
                        Xem tất cả
                    </a>
                </div>

                {savedProducts.length === 0 ? (
                    <p className="text-muted small mb-0">Chưa có tin nào được lưu.</p>
                ) : (
                    savedProducts.map((item) => (
                        <div key={item.id} className="d-flex mb-2 align-items-center">
                            <img
                                src={item.image}
                                alt={item.vehicleInfo?.title || item.name}
                                width="50"
                                height="50"
                                className="rounded me-2 object-fit-cover"
                            />
                            <div>
                                <p className="mb-0 small">{item.vehicleInfo?.description}</p>
                            </div>
                        </div>
                    ))
                )}
            </Card.Body>
        </Card>
    );
};

export default SavedPopup;
