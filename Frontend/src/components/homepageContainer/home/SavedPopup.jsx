import { Card } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import wishlistService from "../../../services/wishlistService";

const SavedPopup = () => {
    const navigate = useNavigate();
    const [state, setState] = useState({
        savedProducts: [],
        loading: false,
        initialized: false
    });

  // Subscribe to wishlistService state changes
  useEffect(() => {
    const initialState = wishlistService.getCurrentState();
    setState(initialState);

    const unsubscribe = wishlistService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

    // Dispatch event for NavbarActions count update
    useEffect(() => {
        const event = new CustomEvent('savedProductsChange', {
            detail: { count: state.savedProducts.length }
        });
        window.dispatchEvent(event);
    }, [state.savedProducts.length]);
    
    // Hiển thị loading
    if (state.loading) {
        return (
            <Card className="shadow" style={{ width: "400px", borderRadius: "10px", overflow: "hidden" }}>
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Tin đăng đã lưu</strong>
                        <button 
                            className="btn btn-link text-decoration-none small border-0" 
                            onClick={() => navigate("/saved-posts")}
                            style={{ 
                                fontSize: "0.875rem",
                                color: "#00A86B",
                                fontWeight: "600",
                                padding: "0",
                                margin: "0",
                                outline: "none",
                                boxShadow: "none"
                            }}
                        >
                            Xem tất cả
                        </button>
                    </div>
                    <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted small mt-2 mb-0">Đang tải...</p>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="shadow" style={{ width: "400px", borderRadius: "10px", overflow: "hidden" }}>
            <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <strong>Tin đăng đã lưu</strong>
                                <button 
                                    className="btn btn-link text-decoration-none small border-0" 
                                    onClick={() => {
                                        // Check if user is logged in
                                        const userData = localStorage.getItem("userData");
                                        const token = localStorage.getItem("token");
                                        const refreshToken = localStorage.getItem("refreshToken");
                                        const isLoggedIn = !!userData || !!token || !!refreshToken;
                                        
                                        if (isLoggedIn) {
                                            // User đã đăng nhập, chuyển thẳng đến saved-posts
                                            navigate("/saved-posts");
                                        } else {
                                            // Guest user, lưu flag và chuyển đến login
                                            localStorage.setItem('redirectToSaved', 'true');
                                            navigate("/login");
                                        }
                                    }}
                                    style={{ 
                                        fontSize: "0.875rem",
                                        color: "#00A86B",
                                        fontWeight: "600",
                                        padding: "0",
                                        margin: "0",
                                        outline: "none",
                                        boxShadow: "none"
                                    }}
                                >
                                    Xem tất cả
                                </button>
                            </div>

                            {(() => {
                                // Check if user is logged in
                                const userData = localStorage.getItem("userData");
                                const token = localStorage.getItem("token");
                                const refreshToken = localStorage.getItem("refreshToken");
                                const isLoggedIn = !!userData || !!token || !!refreshToken;
                                
                                if (!isLoggedIn) {
                                    // Show login required message for guest users
                                    return (
                                        <div className="text-center py-3">
                                            <p className="text-success small mb-2 mt-2 fw-bold">
                                                Vui lòng đăng nhập để xem tin đã lưu
                                            </p>
                                            <button 
                                                className="btn btn-success btn-sm"
                                                onClick={() => {
                                                    // Lưu flag để redirect đến saved-posts sau khi login
                                                    localStorage.setItem('redirectToSaved', 'true');
                                                    navigate("/login");
                                                }}
                                            >
                                                Đăng nhập
                                            </button>
                                        </div>
                                    );
                                } else if (state.savedProducts.length === 0) {
                                    // Show empty state for logged-in users
                                    return (
                                        <div className="text-center py-3">
                                            <i className="bi bi-heart text-muted" style={{ fontSize: "2rem" }}></i>
                                            <p className="text-muted small mb-0 mt-2">
                                                Chưa có tin nào được lưu.
                                            </p>
                                        </div>
                                    );
                                } else {
                                    // Show saved products for logged-in users
                                    return (
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {state.savedProducts.slice(0, 5).map((item) => {
                            const imageUrl = item.imageUrls?.[0] || item.image || "";
                            const title = item.title || item.name || "Sản phẩm";
                            const price = item.price || "";
                            
                            return (
                                <div key={item.id} className="d-flex mb-2 align-items-center">
                                    <img
                                        src={imageUrl || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="}
                                        alt={title}
                                        width="50"
                                        height="50"
                                        className="rounded me-2"
                                        style={{ objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
                                        }}
                                    />
                                    <div className="flex-grow-1">
                                        <p className="mb-0 small text-truncate" style={{ maxWidth: "250px" }}>
                                            {title}
                                        </p>
                                        {price && (
                                            <small className="text-success fw-bold">
                                                {price}
                                            </small>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {state.savedProducts.length > 5 && (
                            <div className="text-center mt-2">
                                <small className="text-muted">Và {state.savedProducts.length - 5} tin đăng khác...</small>
                            </div>
                        )}
                    </div>
                                    );
                                }
                            })()}
            </Card.Body>
        </Card>
    );
};

export default SavedPopup;
