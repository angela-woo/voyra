export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
        개인정보처리방침
      </h1>
      <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-700">
        <section>
          <h2 className="text-lg font-bold mb-2">1. 수집하는 개인정보</h2>
          <p>Voyra는 서비스 이용을 위해 이메일 주소, 닉네임 등 최소한의 정보를 수집합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">2. 개인정보의 이용 목적</h2>
          <p>수집한 개인정보는 서비스 제공, 본인 확인, 뉴스레터 발송 등의 목적으로만 이용됩니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">3. 개인정보 보유 기간</h2>
          <p>회원 탈퇴 시 즉시 삭제하며, 관련 법령에 따라 일정 기간 보관이 필요한 정보는 해당 기간 동안 보관합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">4. 제3자 제공</h2>
          <p>이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 경우는 예외입니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">5. 쿠키 사용</h2>
          <p>인증 세션 유지를 위해 쿠키를 사용합니다. 브라우저 설정을 통해 쿠키를 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">6. 문의</h2>
          <p>개인정보 관련 문의는 <a href="/contact" className="text-[var(--primary)] underline">문의 페이지</a>를 통해 연락해주세요.</p>
        </section>
        <p className="text-xs text-gray-400">최종 업데이트: 2025년 5월</p>
      </div>
    </div>
  )
}
