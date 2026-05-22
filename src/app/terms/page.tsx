import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관',
  description: 'Kiravoy 서비스 이용약관',
  alternates: { canonical: 'https://kiravoy.com/terms' },
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
        이용약관
      </h1>
      <p className="text-sm text-gray-400 mb-10">시행일: 2026년 5월 22일</p>

      <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-700">

        <section>
          <h2 className="text-lg font-bold mb-3">제1조 목적</h2>
          <p>이 약관은 Kiravoy(이하 &quot;서비스&quot;)가 제공하는 여행 정보 및 커뮤니티 서비스 이용에 관한 조건과 절차, 운영자와 이용자 간의 권리·의무 사항을 규정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제2조 정의</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>서비스:</strong> Kiravoy가 운영하는 웹사이트(kiravoy.com) 및 관련 모든 기능</li>
            <li><strong>이용자:</strong> 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원 및 비회원</li>
            <li><strong>회원:</strong> 서비스에 가입하여 계정을 보유한 이용자</li>
            <li><strong>콘텐츠:</strong> 이용자가 서비스 내에 게시한 글, 댓글, 사진 등 일체의 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제3조 약관의 게시와 개정</h2>
          <p>서비스는 이 약관을 서비스 초기 화면 하단에 게시합니다. 약관을 개정할 경우 시행 7일 전부터 공지하며, 이용자가 개정 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제4조 서비스 이용</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>서비스는 여행 정보 제공, 일정 추천, 커뮤니티 기능을 제공합니다.</li>
            <li>일부 기능(댓글, 커뮤니티 글쓰기 등)은 회원 가입 후 이용 가능합니다.</li>
            <li>서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검·장애 등으로 일시 중단될 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제5조 회원 가입 및 탈퇴</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>이용자는 서비스가 정한 양식에 따라 정확한 정보를 입력하여 회원 가입을 신청합니다.</li>
            <li>계정은 본인만 사용 가능하며, 타인에게 양도·대여할 수 없습니다.</li>
            <li>회원 탈퇴는 서비스 내 설정 또는 이메일(imrubywoo@gmail.com)을 통해 신청할 수 있으며, 탈퇴 시 개인정보는 즉시 삭제됩니다.</li>
            <li>계정 정보 관리 소홀로 인한 피해는 이용자 본인이 책임집니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제6조 금지 행위</h2>
          <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>타인의 개인정보 도용 또는 허위 정보 등록</li>
            <li>서비스 운영을 방해하거나 서버에 과도한 부하를 주는 행위</li>
            <li>타인을 비방하거나 명예를 훼손하는 콘텐츠 게시</li>
            <li>음란물, 폭력적 내용 등 불법 콘텐츠 게시</li>
            <li>스팸, 광고성 콘텐츠 무단 게시</li>
            <li>지식재산권 등 타인의 권리를 침해하는 행위</li>
            <li>기타 관련 법령 위반 행위</li>
          </ul>
          <p className="mt-2">위 행위 발견 시 사전 통보 없이 계정 정지 또는 탈퇴 처리될 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제7조 콘텐츠 저작권</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>서비스가 제공하는 여행 가이드, 일정 콘텐츠의 저작권은 Kiravoy에 있습니다.</li>
            <li>일부 콘텐츠는 AI(인공지능) 기술을 활용하여 생성되었으며, 이 경우에도 편집·검수의 책임은 Kiravoy에 있습니다.</li>
            <li>이용자가 게시한 콘텐츠의 저작권은 해당 이용자에게 있으며, 서비스는 서비스 운영 목적에 한하여 이를 이용할 수 있습니다.</li>
            <li>서비스의 콘텐츠를 무단으로 복제·배포·상업적으로 이용하는 행위는 저작권법에 위반될 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제8조 제휴 링크 고지</h2>
          <p>서비스는 이용자에게 편의를 제공하기 위해 아래 제휴사의 어필리에이트(수익 연계) 링크를 포함할 수 있습니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Booking.com</strong> (AWIN 제휴): 숙박 예약 링크</li>
            <li><strong>Klook</strong>: 투어·액티비티 예약 링크</li>
          </ul>
          <p className="mt-2">이용자가 해당 링크를 통해 예약·구매하는 경우, 서비스는 소정의 수수료를 받을 수 있습니다. 링크를 통한 예약 가격은 직접 예약과 동일하며, 이용자에게 추가 비용이 발생하지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제9조 서비스 면책</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>서비스는 이용자가 게시한 콘텐츠의 정확성·신뢰성에 대해 보증하지 않습니다.</li>
            <li>서비스 내 여행 정보(가격, 운영 시간, 입장 여부 등)는 참고용이며, 실제 여행 시 별도 확인이 필요합니다.</li>
            <li>AI 생성 콘텐츠의 경우 사실과 다를 수 있으며, 중요한 사항은 공식 출처에서 반드시 확인하시기 바랍니다.</li>
            <li>천재지변, 통신 장애, 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
            <li>제휴사(Klook, Booking.com 등) 서비스 이용 관련 분쟁은 해당 업체와 직접 해결하셔야 합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제10조 서비스 변경 및 종료</h2>
          <p>서비스는 운영상 필요에 따라 서비스 내용을 변경하거나 종료할 수 있습니다. 서비스 종료 시 30일 전에 공지합니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">제11조 분쟁 해결 및 관할 법원</h2>
          <p>이 약관의 해석과 서비스 이용으로 발생한 분쟁은 대한민국 법률을 따르며, 관할 법원은 민사소송법에 따릅니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">문의</h2>
          <p>이용약관 관련 문의: <strong>imrubywoo@gmail.com</strong></p>
        </section>

      </div>
    </div>
  )
}
