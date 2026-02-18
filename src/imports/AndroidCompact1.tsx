function Field() {
  return (
    <div className="absolute h-[40px] left-[18px] top-[494px] w-[362px]" data-name="field">
      <div className="absolute border border-black border-solid inset-0 rounded-[15px]" />
    </div>
  );
}

function Field1() {
  return (
    <div className="absolute h-[40px] left-[18px] top-[586px] w-[362px]" data-name="field">
      <div className="absolute border border-black border-solid inset-0 rounded-[15px]" />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute h-[30px] left-[269px] top-[667px] w-[111px]">
      <div className="absolute bg-black h-[30px] left-0 rounded-[10px] top-0 w-[111px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Cabin:Regular',sans-serif] font-normal h-[25px] justify-center leading-[0] left-1/2 text-[#e9e9e9] text-[24px] text-center top-[12.5px] w-[111px]" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        <p className="leading-[44px] whitespace-pre-wrap">Login</p>
      </div>
    </div>
  );
}

export default function AndroidCompact() {
  return (
    <div className="bg-[#e9e9e9] relative size-full" data-name="Android Compact - 1">
      <div className="absolute font-['Cormorant:Bold',sans-serif] font-bold leading-[64px] left-[18px] text-[#3b3b3b] text-[57px] top-[223px] whitespace-nowrap">
        <p className="mb-0">Interdisciplinary</p>
        <p>{`Project `}</p>
      </div>
      <p className="absolute font-['Cabin:Regular',sans-serif] font-normal leading-[44px] left-[18px] text-[#171717] text-[24px] top-[351px]" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        Team and Guide Selection
      </p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[27px] not-italic text-[#171717] text-[12px] top-[471px]">university seat number</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[27px] not-italic text-[#171717] text-[12px] top-[564px]">password</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[93px] not-italic text-[12px] text-[rgba(239,239,239,0.4)] top-[564px]">date of birth in DDMMYY format</p>
      <Field />
      <Field1 />
      <Frame />
    </div>
  );
}