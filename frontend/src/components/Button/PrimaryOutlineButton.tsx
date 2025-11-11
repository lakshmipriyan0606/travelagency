import { Button } from '../ui/button';

type PrimaryOutlineButtonProps = {
    buttonName: string;
};

const PrimaryOutlineButton = ({ buttonName }: PrimaryOutlineButtonProps) => {
    return (
        <Button
            className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white rounded px-4 py-2 text-sm font-normal cursor-pointer">
           {buttonName}
        </Button>
    );
};

export default PrimaryOutlineButton;