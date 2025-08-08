# Media Module

A comprehensive media management system for the Markt social e-commerce platform, supporting image and video uploads with automatic variant generation, social media optimization, and S3 integration.

## Features

### 🖼️ Image Processing
- **Essential Variants**: Automatic generation of thumbnail, small, and medium variants on upload
- **On-Demand Variants**: Large, mobile, tablet, desktop, and social media variants generated when requested
- **Responsive Design**: Mobile, tablet, and desktop optimized images
- **Social Media Optimization**: Square, story, and post formats for different platforms with automatic variant generation
- **Quality Compression**: Maintains quality while reducing file sizes
- **Background Removal**: Placeholder for future implementation using removebg API

### 🎥 Video Support
- **Video Upload**: Support for MP4, MOV, AVI, MKV formats
- **Size Limits**: 100MB maximum file size, 5 minutes duration
- **MVP Implementation**: Basic upload with future processing capabilities

### ☁️ S3 Integration
- **Secure Storage**: All media stored in AWS S3 with proper access controls
- **CDN Support**: Optional CDN domain configuration for faster delivery
- **Presigned URLs**: Secure temporary access for downloads
- **Automatic Cleanup**: Deletion of original and variant files

### 📱 Social Media Integration
- **Platform Optimization**: Instagram, Facebook, Twitter, LinkedIn support
- **Post Types**: Story, post, reel, carousel formats
- **Aspect Ratios**: Automatic cropping for different social media requirements

### 🛍️ Product Integration
- **Product Images**: Dedicated product image management
- **Sort Order**: Configurable image ordering
- **Featured Images**: Mark primary product images
- **Alt Text**: SEO and accessibility support

## API Endpoints

### Media Upload & Management

#### `POST /api/v1/media/upload`
Upload media file with automatic processing.

**Form Data:**
- `file`: Media file (image or video)
- `alt_text` (optional): Alt text for accessibility
- `caption` (optional): Image caption
- `is_public` (optional): Public visibility (default: true)
- `remove_background` (optional): Background removal flag (placeholder)
- `compression_quality` (optional): JPEG quality 1-100 (default: 85)
- `optimize_for_social` (optional): Generate social media variants (default: true)
- `platforms` (optional): Target platforms for optimization

**Response:**
```json
{
  "success": true,
  "media": {
    "id": 1,
    "storage_key": "images/user123/product.jpg",
    "media_type": "image",
    "mime_type": "image/jpeg",
    "width": 1920,
    "height": 1080,
    "file_size": 1024000,
    "alt_text": "Product image",
    "caption": "Amazing product",
    "original_filename": "product.jpg",
    "processing_status": "completed",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "variants": [],  // Essential variants generated asynchronously
  "urls": {
    "original": "https://...",
    "type": "image",
    "mime_type": "image/jpeg"
  },
  "upload_time": 1.23,
  "message": "Successfully uploaded image. Variants are being generated in the background.",
  "processing_note": "Image variants are being generated asynchronously and will be available shortly."
}
```

#### `GET /api/v1/media/{media_id}`
Get media details by ID.

#### `GET /api/v1/media/{media_id}/urls`
Get all URLs for a media object.

#### `DELETE /api/v1/media/{media_id}`
Delete media and all variants (requires ownership or admin).

### Social Media Optimization

#### `POST /api/v1/media/{media_id}/social-optimize`
Get optimized URLs for social media platforms. Automatically generates required variants if they don't exist.

**Request Body:**
```json
{
  "platform": "instagram",
  "post_type": "story"
}
```

**Response:**
```json
{
  "platform": "instagram",
  "post_type": "story",
  "optimized_url": "https://...",
  "original_url": "https://...",
  "dimensions": {"width": 1080, "height": 1920},
  "file_size": 245760
}
```

**Note**: If the required social media variant doesn't exist, it will be generated on-demand before returning the optimized URL.

#### `POST /api/v1/media/{media_id}/remove-background`
Remove background from image (placeholder for future implementation).

### Media Listing & Filtering

#### `GET /api/v1/media/`
List media with filtering and pagination.

**Query Parameters:**
- `media_type`: Filter by media type (image, video, document, audio)
- `user_id`: Filter by user
- `is_public`: Filter by public status
- `processing_status`: Filter by processing status
- `created_after`: Filter by creation date
- `created_before`: Filter by creation date
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20)

### Product Images

#### `POST /api/v1/media/products/{product_id}/images`
Add image to product.

#### `GET /api/v1/media/products/{product_id}/images`
Get all images for a product.

#### `DELETE /api/v1/media/products/{product_id}/images/{image_id}`
Delete product image.

### Social Media Posts

#### `POST /api/v1/media/social-posts/{post_id}/media`
Add media to social media post.

#### `GET /api/v1/media/social-posts/{post_id}/media`
Get all media for a social media post.

#### `DELETE /api/v1/media/social-posts/{post_id}/media/{media_id}`
Delete social media post media.

### Utility Endpoints

#### `GET /api/v1/media/{media_id}/download`
Get presigned download URL.

#### `GET /api/v1/media/{media_id}/variants`
Get all variants for a media object.

#### `POST /api/v1/media/{media_id}/generate-variants`
Generate on-demand variants for a media object.

**Request Body:**
```json
{
  "platform": "instagram",
  "post_type": "story"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Generated 1 variants",
  "media_id": 123,
  "variants_generated": 1
}
```

#### `GET /api/v1/media/stats`
Get media statistics (admin only).

## Database Models

### Media
Core media object storing file metadata and relationships.

**Key Fields:**
- `storage_key`: S3 object key
- `media_type`: Image, video, document, or audio
- `width`, `height`: Image/video dimensions
- `file_size`: File size in bytes
- `duration`: Video/audio duration in seconds
- `alt_text`, `caption`: Accessibility and description
- `processing_status`: Processing state
- `background_removed`: Background removal flag
- `compression_quality`: JPEG quality used
- `exif_data`: EXIF metadata

### MediaVariant
Stores different size/quality variants of images.

**Key Fields:**
- `variant_type`: Thumbnail, small, medium, large, mobile, tablet, desktop, social variants
- `storage_key`: S3 key for variant
- `width`, `height`: Variant dimensions
- `quality`: JPEG quality
- `format`: Image format
- `processing_time`: Processing duration

### ProductImage
Links media to products with ordering and featured status.

### SocialMediaPost
Links media to social media posts with platform-specific metadata.

## Configuration

### Environment Variables
```bash
# AWS Configuration
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=markt-media
CDN_DOMAIN=cdn.yourdomain.com  # Optional
```

### Image Variant Configuration
```python
# Essential variants (generated immediately on upload)
essential_variants = {
    MediaVariantType.THUMBNAIL: {"size": (150, 150), "quality": 80},
    MediaVariantType.SMALL: {"size": (300, 300), "quality": 85},
    MediaVariantType.MEDIUM: {"size": (600, 600), "quality": 85},
}

# On-demand variants (generated when requested)
on_demand_variants = {
    MediaVariantType.LARGE: {"size": (1200, 1200), "quality": 90},
    MediaVariantType.MOBILE: {"size": (400, 600), "quality": 85},
    MediaVariantType.TABLET: {"size": (800, 600), "quality": 85},
    MediaVariantType.DESKTOP: {"size": (1200, 800), "quality": 90},
    MediaVariantType.SOCIAL_SQUARE: {"size": (1080, 1080), "quality": 90},
    MediaVariantType.SOCIAL_STORY: {"size": (1080, 1920), "quality": 90},
    MediaVariantType.SOCIAL_POST: {"size": (1200, 630), "quality": 90},
}
```

## File Size Limits

### Images
- **Maximum Size**: 10MB
- **Maximum Dimensions**: 4000x4000 pixels
- **Supported Formats**: JPG, JPEG, PNG, WebP, GIF

### Videos
- **Maximum Size**: 100MB
- **Maximum Duration**: 5 minutes
- **Supported Formats**: MP4, MOV, AVI, MKV

## Variant Generation Strategy

### Essential Variants (Generated Immediately)
Essential variants are generated asynchronously right after upload to ensure fast access to commonly used image sizes:
- **Thumbnail** (150x150): For previews and lists
- **Small** (300x300): For cards and grids
- **Medium** (600x600): For detailed views

### On-Demand Variants (Generated When Requested)
On-demand variants are generated only when specifically requested, reducing initial processing time:
- **Large** (1200x1200): For high-resolution displays
- **Mobile** (400x600): For mobile-optimized layouts
- **Tablet** (800x600): For tablet-optimized layouts
- **Desktop** (1200x800): For desktop-optimized layouts
- **Social Media Variants**: Automatically generated when using social media optimization endpoints

### Benefits
- **Faster Upload**: Reduced initial processing time
- **Cost Efficiency**: Only generate variants when needed
- **Scalability**: Better resource utilization
- **User Experience**: Essential variants available immediately

## Future Enhancements

### Background Removal
- Integration with removebg API or similar services
- Automatic background removal for product images
- Batch processing capabilities

### Video Processing
- Video thumbnail generation
- Video compression and optimization
- Video format conversion
- Video duration extraction

### Advanced Features
- AI-powered image tagging
- Automatic alt text generation
- Image similarity detection
- Bulk upload and processing
- Image editing capabilities
- Watermarking support

### Performance Optimizations
- Async processing with Celery for essential variant generation
- On-demand variant generation to reduce initial processing time
- Image processing queue management
- CDN integration for faster delivery
- Caching strategies
- Progressive image loading

## Usage Examples

### Upload Image with Social Media Optimization
```python
import requests

# Upload image (essential variants generated asynchronously)
files = {'file': open('product.jpg', 'rb')}
data = {
    'alt_text': 'Product image',
    'caption': 'Amazing product',
    'optimize_for_social': True
}

response = requests.post('/api/v1/media/upload', files=files, data=data)
media_data = response.json()

# Get social media optimized URL (generates variants on-demand if needed)
social_data = {
    'platform': 'instagram',
    'post_type': 'story'
}
social_response = requests.post(
    f'/api/v1/media/{media_data["media"]["id"]}/social-optimize',
    json=social_data
)
optimized_url = social_response.json()['optimized_url']
```

### Add Product Image
```python
# Add media to product
product_image_data = {
    'media_id': media_id,
    'sort_order': 1,
    'is_featured': True,
    'alt_text': 'Main product image'
}

response = requests.post(
    f'/api/v1/media/products/{product_id}/images',
    json=product_image_data
)
```

## Error Handling

The module includes comprehensive error handling for:
- File validation errors
- S3 upload failures
- Image processing errors
- Database constraint violations
- Authorization failures

All errors return appropriate HTTP status codes and descriptive error messages.

## Security Considerations

- File type validation
- File size limits
- User authorization checks
- S3 bucket access controls
- Presigned URL expiration
- Input sanitization
- SQL injection prevention

## Monitoring & Logging

- Upload success/failure tracking
- Processing time monitoring
- Error rate tracking
- Storage usage monitoring
- Performance metrics
- User activity logging 