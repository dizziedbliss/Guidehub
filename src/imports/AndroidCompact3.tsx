import imgBack from "figma:asset/e35dec8917218253e82dcec26d379008387f0cd1.png";

function Frame() {
  return (
    <div className="absolute h-[15px] left-[315px] top-[14px] w-[23px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 15">
        <g id="Frame 9" />
      </svg>
    </div>
  );
}

function Field() {
  return (
    <div className="absolute h-[40px] left-0 top-0 w-[362px]" data-name="field">
      <div className="absolute bg-[#3b3b3b] inset-0 rounded-[10px]" />
      <p className="absolute font-['Cabin:Regular',sans-serif] font-normal inset-[30%_6.08%_27.5%_6.08%] leading-[normal] overflow-hidden text-[#e9e9e9] text-[14px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        Computer Science Engineering
      </p>
      <Frame />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute h-[40px] left-0 top-0 w-[362px]">
      <Field />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute h-[15px] left-[315px] top-[14px] w-[23px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 15">
        <g id="Frame 9" />
      </svg>
    </div>
  );
}

function Field1() {
  return (
    <div className="absolute h-[40px] left-0 top-0 w-[362px]" data-name="field">
      <div className="absolute bg-[#3b3b3b] inset-0 rounded-[10px]" />
      <p className="absolute font-['Cabin:Regular',sans-serif] font-normal inset-[30%_6.08%_27.5%_6.08%] leading-[normal] overflow-hidden text-[#e9e9e9] text-[14px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "\'wdth\' 100" }}>{`Artificial intelligence & Machine learning`}</p>
      <Frame1 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute h-[40px] left-0 top-[51px] w-[362px]">
      <Field1 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute h-[15px] left-[315px] top-[14px] w-[23px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 15">
        <g id="Frame 9" />
      </svg>
    </div>
  );
}

function Field2() {
  return (
    <div className="absolute h-[40px] left-0 top-[102px] w-[362px]" data-name="field">
      <div className="absolute bg-[#3b3b3b] inset-0 rounded-[10px]" />
      <p className="absolute font-['Cabin:Regular',sans-serif] font-normal inset-[30%_6.08%_27.5%_6.08%] leading-[normal] overflow-hidden text-[#e9e9e9] text-[14px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        Mechanical Engineering
      </p>
      <Frame2 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute h-[15px] left-[315px] top-[14px] w-[23px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 15">
        <g id="Frame 9" />
      </svg>
    </div>
  );
}

function Field3() {
  return (
    <div className="absolute h-[40px] left-0 top-[153px] w-[362px]" data-name="field">
      <div className="absolute bg-[#3b3b3b] inset-0 rounded-[10px]" />
      <p className="absolute font-['Cabin:Regular',sans-serif] font-normal inset-[30%_6.08%_27.5%_6.08%] leading-[normal] overflow-hidden text-[#e9e9e9] text-[14px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        Electrical Engineering
      </p>
      <Frame7 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="absolute h-[15px] left-[315px] top-[14px] w-[23px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 15">
        <g id="Frame 9" />
      </svg>
    </div>
  );
}

function Field4() {
  return (
    <div className="absolute h-[40px] left-0 top-[204px] w-[362px]" data-name="field">
      <div className="absolute bg-[#3b3b3b] inset-0 rounded-[10px]" />
      <p className="absolute font-['Cabin:Regular',sans-serif] font-normal inset-[30%_6.08%_27.5%_6.08%] leading-[normal] overflow-hidden text-[#e9e9e9] text-[14px] text-ellipsis whitespace-nowrap" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        Electrical Engineering
      </p>
      <Frame8 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="absolute h-[244px] left-0 top-0 w-[362px]">
      <Frame3 />
      <Frame4 />
      <Field2 />
      <Field3 />
      <Field4 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute h-[244px] left-[25px] top-[271px] w-[362px]">
      <Frame6 />
    </div>
  );
}

export default function AndroidCompact() {
  return (
    <div className="bg-[#e9e9e9] relative size-full" data-name="Android Compact - 3">
      <p className="absolute font-['Cormorant:Bold',sans-serif] font-bold leading-[64px] left-[22px] text-[#3b3b3b] text-[57px] top-[16px]">IP</p>
      <p className="absolute font-['Cormorant:Regular',sans-serif] font-normal leading-[52px] left-[64px] text-[#171717] text-[40px] top-[92px]">Select a guide</p>
      <div className="absolute h-[42px] left-[25px] top-[97px] w-[30px]" data-name="Back">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgBack} />
      </div>
      <Frame5 />
      <p className="absolute font-['Cabin:Regular',sans-serif] font-normal leading-[44px] left-[26px] text-[#171717] text-[24px] top-[218px]" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        Departments
      </p>
    </div>
  );
}