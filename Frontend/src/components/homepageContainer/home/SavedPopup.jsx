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
                                src={item.image && item.image.trim() !== "" ? item.image : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="}
                                alt={item.title || item.vehicleInfo?.title || item.name || "saved-item"}
                                width="50"
                                height="50"
                                className="rounded me-2 object-fit-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
                                }}
                            />
                            <div>
                                <p className="mb-0 small">{item.title || item.vehicleInfo?.description}</p>
                            </div>
                        </div>
                    ))
                )}
            </Card.Body>
        </Card>
    );
};

export default SavedPopup;
