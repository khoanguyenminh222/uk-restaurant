/**
 * LegalConfig Model
 * Schema cho cấu hình các trang pháp lý (Chính sách bảo mật, Điều khoản sử dụng)
 */

/**
 * Default values cho LegalConfig
 */
export const defaultLegalConfig = {
    config_type: 'legal',
    privacy_policy: {
        title: 'Chính sách bảo mật',
        content: `<h3>1. Thu thập thông tin</h3>
<p>Chúng tôi thu thập thông tin cá nhân mà bạn cung cấp trực tiếp cho chúng tôi khi bạn đặt hàng hoặc đăng ký tài khoản. Thông tin này có thể bao gồm: tên, địa chỉ email, số điện thoại và địa chỉ giao hàng.</p>
<h3>2. Sử dụng thông tin</h3>
<p>Thông tin của bạn được sử dụng để:</p>
<ul>
  <li>Xử lý và giao đơn hàng của bạn.</li>
  <li>Gửi thông báo về trạng thái đơn hàng.</li>
  <li>Cung cấp dịch vụ khách hàng và hỗ trợ kỹ thuật.</li>
  <li>Gửi thông tin khuyến mãi (nếu bạn đồng ý nhận).</li>
</ul>
<h3>3. Bảo mật thông tin</h3>
<p>Chúng tôi cam kết bảo vệ thông tin cá nhân của khách hàng. Chúng tôi sử dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu khỏi sự truy cập trái phép, mất mát hoặc phá hủy.</p>
<h3>4. Chia sẻ thông tin với bên thứ ba</h3>
<p>Chúng tôi chỉ chia sẻ thông tin cần thiết (như địa chỉ và số điện thoại) với các đối tác giao hàng để hoàn tất đơn đặt hàng của bạn. Chúng tôi không bán hoặc cung cấp thông tin của bạn cho bất kỳ bên thứ ba nào khác vì mục đích tiếp thị.</p>
<h3>5. Thay đổi chính sách</h3>
<p>Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được công bố trên trang web này.</p>`,
        updated_at: new Date().toISOString()
    },
    terms_of_service: {
        title: 'Điều khoản sử dụng',
        content: `<h3>1. Chấp nhận điều khoản</h3>
<p>Bằng cách truy cập và sử dụng trang web này, bạn đồng ý tuân thủ toàn bộ các điều khoản và điều kiện sử dụng cũng như các chính sách của chúng tôi.</p>
<h3>2. Dịch vụ đặt hàng</h3>
<p>Dịch vụ của chúng tôi cho phép bạn xem thực đơn và đặt món ăn trực tuyến. Chúng tôi cam kết cung cấp thông tin giá cả và nguyên liệu chính xác nhất có thể.</p>
<h3>3. Quy định về thanh toán và giá cả</h3>
<p>Tất cả giá niêm yết trên website đã bao gồm thuế (nếu có). Bạn có trách nhiệm thanh toán đầy đủ giá trị đơn hàng cho nhân viên giao hàng hoặc qua các cổng thanh toán được tích hợp.</p>
<h3>4. Chính sách hủy đơn và hoàn tiền</h3>
<p>Bạn có thể hủy đơn hàng trong vòng 5 phút sau khi đặt nếu đơn hàng chưa được nhà hàng xác nhận hoặc bắt đầu chế biến. Trường hợp món ăn không đúng yêu cầu hoặc không đảm bảo chất lượng, chúng tôi sẽ xem xét bồi hoàn hoặc đổi món mới.</p>
<h3>5. Trách nhiệm người dùng</h3>
<p>Bạn cam kết cung cấp thông tin chính xác khi đặt hàng. Chúng tôi có quyền từ chối phục vụ nếu phát hiện thông tin giả mạo hoặc có dấu hiệu spam.</p>
<h3>6. Liên hệ</h3>
<p>Nếu có bất kỳ câu hỏi nào về điều khoản này, vui lòng liên hệ với chúng tôi qua thông tin được cung cấp trên trang Liên hệ.</p>`,
        updated_at: new Date().toISOString()
    }
};

/**
 * Validate legal config data
 */
export function validateLegalConfig(data) {
    const errors = [];

    if (data.privacy_policy) {
        if (data.privacy_policy.title && data.privacy_policy.title.length > 200) {
            errors.push('Privacy Policy: Title không được vượt quá 200 ký tự');
        }
        if (data.privacy_policy.content && data.privacy_policy.content.length > 50000) {
            errors.push('Privacy Policy: Content quá dài (tối đa 50,000 ký tự)');
        }
    }

    if (data.terms_of_service) {
        if (data.terms_of_service.title && data.terms_of_service.title.length > 200) {
            errors.push('Terms of Service: Title không được vượt quá 200 ký tự');
        }
        if (data.terms_of_service.content && data.terms_of_service.content.length > 50000) {
            errors.push('Terms of Service: Content quá dài (tối đa 50,000 ký tự)');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Merge config với default values
 */
export function mergeWithDefaults(config) {
    const merged = JSON.parse(JSON.stringify(defaultLegalConfig));

    if (config.privacy_policy) {
        merged.privacy_policy = { ...merged.privacy_policy, ...config.privacy_policy };
    }

    if (config.terms_of_service) {
        merged.terms_of_service = { ...merged.terms_of_service, ...config.terms_of_service };
    }

    return merged;
}
