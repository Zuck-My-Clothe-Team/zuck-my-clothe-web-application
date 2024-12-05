type CardWrapperProps = {
  title: string;
  children: React.ReactNode;
};
const CardWrapper: React.FC<CardWrapperProps> = (props) => {
  return (
    <div className="rounded-[10px] bg-background-1 py-4 px-5 border border-white">
      <h2 className="font-normal text-primaryblue-200 text-xl">
        {props.title}
      </h2>
      <hr className="my-4 border-secondaryblue-200" />
      <div className=" md:px-2 py-1.5">{props.children}</div>
    </div>
  );
};

export default CardWrapper;
