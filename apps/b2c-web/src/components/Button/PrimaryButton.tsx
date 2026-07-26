import { Button } from '@travelagency/ui'

interface PrimaryButtonProps {
  buttonText: string;
  className?: string;
  type: "button" | "submit" | "reset" | undefined;
  onClick?: () => void;
}

const PrimaryButton = ({ buttonText, className, type = 'button', ...rest }: PrimaryButtonProps) => {
  return (
    <div>
      <Button type={type} className={`bg-primary text-white hover:bg-primary/90 cursor-pointer ${className}`} {...rest}>{buttonText}</Button>
    </div>
  )
}

export default PrimaryButton
