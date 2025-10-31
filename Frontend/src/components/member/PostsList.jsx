import { Alert, Button, Spinner } from "react-bootstrap";
import PostCard from "./PostCard";

const PostsList = ({
  loadingPosts,
  posts,
  filteredPosts,
  currentImageIndexes,
  postingProducts,
  getPostImages,
  handlePrevImage,
  handleNextImage,
  handleEditPost,
  handleDeletePost,
  handlePostProduct,
  getStatusText,
  getStatusColor,
  formatDate,
  formatCurrency,
  navigate,
}) => {
  if (loadingPosts) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" className="mb-3" />
        <p className="text-muted">Đang tải danh sách tin đăng...</p>
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <Alert variant="info" className="text-center py-5">
        {posts.length === 0 ? (
          <>
            <h5>Bạn chưa có tin đăng nào</h5>
            <p className="mb-3">
              Hãy đăng tin đầu tiên để bắt đầu bán hàng!
            </p>
            <Button variant="success" onClick={() => navigate("/post-ad")}>
              Đăng tin ngay
            </Button>
          </>
        ) : (
          <p className="mb-0">
            Không tìm thấy tin đăng phù hợp với bộ lọc.
          </p>
        )}
      </Alert>
    );
  }

  return (
    <div className="posts-list-container">
      {filteredPosts.map((post) => {
        const postImages = getPostImages(post);
        const currentImageIndex = currentImageIndexes[post.id] || 0;
        const hasMultipleImages = postImages.length > 1;

        return (
          <PostCard
            key={post.id}
            post={post}
            currentImageIndex={currentImageIndex}
            hasMultipleImages={hasMultipleImages}
            postImages={postImages}
            postingProducts={postingProducts}
            onPrevImage={() => handlePrevImage(post.id, postImages)}
            onNextImage={() => handleNextImage(post.id, postImages)}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onPostProduct={handlePostProduct}
            getStatusText={getStatusText}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        );
      })}
    </div>
  );
};

export default PostsList;

